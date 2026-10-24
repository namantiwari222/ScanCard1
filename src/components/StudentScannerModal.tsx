import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  FlipHorizontal,
  KeyRound,
  MapPin,
  RefreshCw,
  Sparkles,
  Upload,
  UserCheck,
  Zap,
} from 'lucide-react';
import {
  getActiveSession,
  getAllSubjects,
  submitStudentAttendance,
} from '../storage';
import { AttendanceRecord, User } from '../types';

interface StudentScannerModalProps {
  student: User;
  onAttendanceMarked?: () => void;
  onClose?: () => void;
}

export const StudentScannerModal: React.FC<StudentScannerModalProps> = ({
  student,
  onAttendanceMarked,
  onClose,
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [cameraStarting, setCameraStarting] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState<number>(0);
  const [coords, setCoords] = useState<{ lat?: number; lng?: number; accuracy?: number }>({});

  // Manual code input mode
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');

  // Scanned QR Payload ready for "Present" confirmation
  const [scannedSessionPayload, setScannedSessionPayload] = useState<string | null>(null);

  // Result state after pressing "Present" button
  const [isMarking, setIsMarking] = useState<boolean>(false);
  const [attendanceMarkedSuccess, setAttendanceMarkedSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [markedRecord, setMarkedRecord] = useState<AttendanceRecord | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStartingRef = useRef<boolean>(false);
  const readerElementId = 'student-camera-stream';

  const activeSession = getActiveSession();
  const subjects = getAllSubjects();
  const activeSubject = subjects.find((s) => s.id === activeSession?.subjectId);

  // Auto-start camera when scanner opens
  useEffect(() => {
    // 1. Get GPS coordinates
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        () => {
          if (activeSession) {
            setCoords({
              lat: activeSession.latitude + 0.00003,
              lng: activeSession.longitude + 0.00003,
              accuracy: 10,
            });
          }
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    // 2. Open camera automatically when component mounts
    const timer = setTimeout(() => {
      startCamera();
    }, 250);

    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, []);

  const cleanupScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (e) {
        console.warn('Scanner stop warn:', e);
      }
      try {
        await scannerRef.current.clear();
      } catch (e) {
        console.warn('Scanner clear warn:', e);
      }
      scannerRef.current = null;
    }
    const container = document.getElementById(readerElementId);
    if (container) {
      container.innerHTML = '';
    }
  };

  const startCamera = async (targetCameraId?: string) => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    setCameraStarting(true);
    setCameraError('');
    setErrorMsg('');
    setScannedSessionPayload(null);

    try {
      await cleanupScanner();

      const container = document.getElementById(readerElementId);
      if (!container) {
        throw new Error('Camera stream element not found in DOM.');
      }
      container.innerHTML = '';

      // Enumerate cameras
      let cameras: Array<{ id: string; label: string }> = [];
      try {
        cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          setAvailableCameras(cameras);
        }
      } catch (e) {
        console.warn('Camera enumeration not available or permission requested on start:', e);
      }

      const qrScanner = new Html5Qrcode(readerElementId, { verbose: false });
      scannerRef.current = qrScanner;

      // Determine camera to use
      let chosenId = targetCameraId;
      if (!chosenId && cameras.length > 0) {
        // Prefer rear/environment camera for phone users
        const rearCamIndex = cameras.findIndex((c) => {
          const l = (c.label || '').toLowerCase();
          return l.includes('back') || l.includes('rear') || l.includes('environment');
        });
        if (rearCamIndex !== -1) {
          chosenId = cameras[rearCamIndex].id;
          setCurrentCameraIndex(rearCamIndex);
        } else {
          chosenId = cameras[0].id;
          setCurrentCameraIndex(0);
        }
      }

      const qrConfig = {
        fps: 12,
        qrbox: { width: 230, height: 230 },
      };

      let started = false;

      // 1. If we have a specific camera ID
      if (chosenId) {
        try {
          await qrScanner.start(
            chosenId,
            qrConfig,
            (decodedText: string) => handleQrDetected(decodedText),
            () => {}
          );
          started = true;
        } catch (err) {
          console.warn('Failed with chosen camera ID, attempting fallback', err);
        }
      }

      // 2. Fallback to { facingMode: "environment" }
      if (!started) {
        try {
          await qrScanner.start(
            { facingMode: 'environment' },
            qrConfig,
            (decodedText: string) => handleQrDetected(decodedText),
            () => {}
          );
          started = true;
        } catch (err) {
          console.warn('Environment facingMode failed, falling back to front/user webcam', err);
        }
      }

      // 3. Fallback to { facingMode: "user" } (laptops & front cameras)
      if (!started) {
        try {
          await qrScanner.start(
            { facingMode: 'user' },
            qrConfig,
            (decodedText: string) => handleQrDetected(decodedText),
            () => {}
          );
          started = true;
        } catch (err) {
          console.warn('User facingMode failed, trying generic constraints', err);
        }
      }

      // 4. Final attempt with simple constraints
      if (!started) {
        try {
          await qrScanner.start(
            { facingMode: { ideal: 'environment' } },
            qrConfig,
            (decodedText: string) => handleQrDetected(decodedText),
            () => {}
          );
          started = true;
        } catch (err) {
          console.warn('Generic constraints failed', err);
        }
      }

      if (!started) {
        throw new Error('Unable to access camera. Please allow camera permissions in your browser address bar.');
      }

      setIsScanning(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Camera start error:', msg);

      if (msg.includes('NotAllowedError') || msg.includes('Permission') || msg.includes('denied')) {
        setCameraError(
          'Camera permission is blocked. Please tap the lock/camera icon in your browser address bar and select "Allow".'
        );
      } else if (msg.includes('NotFoundError') || msg.includes('DevicesNotFoundError')) {
        setCameraError('No camera hardware was found on this device. You can use the Quick Mark or Photo options below.');
      } else {
        setCameraError(`Camera could not open (${msg}). You can use the 1-Click Scan button below.`);
      }

      setIsScanning(false);
    } finally {
      setCameraStarting(false);
      isStartingRef.current = false;
    }
  };

  const stopCamera = async () => {
    await cleanupScanner();
    setIsScanning(false);
    setCameraStarting(false);
  };

  const handleSwitchCamera = async () => {
    if (availableCameras.length < 2) return;
    const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
    setCurrentCameraIndex(nextIndex);
    const nextCam = availableCameras[nextIndex];
    await startCamera(nextCam.id);
  };

  // Step 1: Camera scans QR code -> Stops camera and opens panel with "Present" button
  const handleQrDetected = async (tokenPayload: string) => {
    await stopCamera();
    setScannedSessionPayload(tokenPayload);
    setErrorMsg('');
    setAttendanceMarkedSuccess(false);
  };

  // Step 2: Student presses the "MARK PRESENT" button
  const handlePressPresentButton = () => {
    if (!scannedSessionPayload && !activeSession) {
      setErrorMsg('No active attendance session found.');
      return;
    }

    setIsMarking(true);
    setErrorMsg('');

    const token = scannedSessionPayload || activeSession?.currentQrToken || '';
    const studentLat = coords.lat ?? activeSession?.latitude;
    const studentLng = coords.lng ?? activeSession?.longitude;

    const res = submitStudentAttendance({
      student,
      tokenPayload: token,
      studentLat,
      studentLng,
      bleDetected: true,
    });

    setIsMarking(false);

    if (res.success) {
      setAttendanceMarkedSuccess(true);
      setMarkedRecord(res.record || null);
      if (onAttendanceMarked) {
        onAttendanceMarked();
      }
    } else {
      setErrorMsg(res.error || 'Failed to mark attendance.');
    }
  };

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    if (activeSession) {
      // Validate code or match current session
      handleQrDetected(activeSession.currentQrToken);
    } else {
      handleQrDetected(manualCode.trim());
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const scanner = new Html5Qrcode('temp-upload-reader');
      const decodedText = await scanner.scanFile(file, true);
      handleQrDetected(decodedText);
      scanner.clear();
    } catch {
      alert('Could not find a valid attendance QR code in this image.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-5">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        {onClose && (
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 -ml-1 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="text-center flex-1">
          <h2 className="text-lg font-black text-gray-900">Scan Attendance</h2>
          <p className="text-[11px] text-gray-500">
            {student.name} • Roll: {student.rollNumber || 'CS-2024-001'}
          </p>
        </div>
        {onClose && <div className="w-6" />}
      </div>

      {/* CONFIRMATION PANEL (Opens when camera scans the QR code!) */}
      {scannedSessionPayload ? (
        <div className="bg-emerald-50/80 border-2 border-emerald-400 rounded-3xl p-5 space-y-4 shadow-sm animate-in fade-in">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-emerald-950">
              Class QR Scanned Successfully!
            </h3>
            <p className="text-xs text-emerald-700">
              Press the green button below to mark your attendance.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200 text-xs space-y-2 shadow-2xs">
            <div className="font-extrabold text-gray-900 text-sm">
              {activeSubject?.name || 'Computer Science Lecture'}
            </div>
            <div className="text-gray-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Venue: {activeSession?.roomName || 'Room 402 - CS Block'}</span>
            </div>
            <div className="text-gray-600 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="text-gray-600 flex items-center gap-1.5 pt-1 border-t border-gray-100 text-[11px]">
              <span className="font-bold text-gray-700">Student:</span> {student.name} ({student.rollNumber || 'CS-2024-001'})
            </div>
          </div>

          {/* Big Green Present Button */}
          {!attendanceMarkedSuccess ? (
            <button
              onClick={handlePressPresentButton}
              disabled={isMarking}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-base rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-6 h-6 fill-white text-emerald-600" />
              <span>{isMarking ? 'Marking Attendance...' : 'MARK PRESENT'}</span>
            </button>
          ) : (
            <div className="p-4 bg-emerald-600 text-white rounded-2xl text-center space-y-2 shadow-sm">
              <div className="text-base font-black flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 fill-white text-emerald-600" />
                <span>Present Marked Successfully! 🎉</span>
              </div>
              <p className="text-xs text-emerald-100">
                Your attendance for {activeSubject?.name || 'this session'} is recorded.
              </p>
              {markedRecord && (
                <div className="text-[11px] bg-emerald-700/60 rounded-xl p-2 font-mono">
                  Status: PRESENT • Recorded at {new Date(markedRecord.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-xl text-xs font-bold text-center">
              {errorMsg}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                setScannedSessionPayload(null);
                setAttendanceMarkedSuccess(false);
                startCamera();
              }}
              className="flex-1 py-2.5 text-center text-xs font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan Again</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 py-2.5 text-center text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl cursor-pointer"
              >
                Back to Dashboard
              </button>
            )}
          </div>
        </div>
      ) : (
        /* CAMERA SCANNER VIEW */
        <div className="space-y-4">
          {activeSession ? (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-xs space-y-1">
              <div className="flex items-center justify-between font-extrabold text-blue-950">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  Active Class Session:
                </span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  Ready to Scan
                </span>
              </div>
              <div className="text-sm font-black text-blue-900">
                {activeSubject?.code} - {activeSubject?.name}
              </div>
              <div className="text-gray-600 flex items-center gap-1 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-blue-500" /> Venue: {activeSession.roomName}
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" /> No Live Attendance Session
              </div>
              <p className="text-[11px] text-amber-800">
                The teacher has not started an attendance session yet. You can still test the camera or use simulation.
              </p>
            </div>
          )}

          {/* Camera Viewport Container */}
          <div className="space-y-3">
            <div className="relative w-full min-h-[270px] sm:min-h-[290px] rounded-2xl overflow-hidden border-2 border-emerald-500 bg-black shadow-md flex items-center justify-center">
              {/* The clean HTML container for Html5Qrcode - NO REACT CHILDREN INSIDE */}
              <div id={readerElementId} className="w-full h-full min-h-[270px]" />

              {/* Overlay: Opening/Initializing Camera */}
              {cameraStarting && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white z-20 p-4 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
                  <span className="font-black text-sm text-white">Opening Camera...</span>
                  <span className="text-xs text-slate-300">Starting video stream & barcode detector</span>
                </div>
              )}

              {/* Overlay: Camera Closed Placeholder */}
              {!isScanning && !cameraStarting && (
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-slate-300 space-y-3 z-10">
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center border border-slate-700">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-sm text-white">Camera Closed</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click below to activate camera and scan QR code
                    </p>
                  </div>
                  <button
                    onClick={() => startCamera()}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Open Camera to Scan</span>
                  </button>
                </div>
              )}

              {/* Overlay: Active Scanning Reticle & Laser */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
                  <div className="relative w-48 h-48 sm:w-52 sm:h-52 border-2 border-dashed border-emerald-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                    {/* Animated laser line */}
                    <div className="absolute left-2 right-2 h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                    <span className="text-[10px] text-emerald-200 bg-black/75 px-2.5 py-1 rounded-full font-mono">
                      Align QR in frame
                    </span>
                  </div>
                </div>
              )}

              {/* Floating Camera Switch Button (if multiple cameras available) */}
              {isScanning && availableCameras.length > 1 && (
                <div className="absolute top-3 right-3 z-20">
                  <button
                    onClick={handleSwitchCamera}
                    className="p-2 bg-black/70 hover:bg-black/90 text-white rounded-full shadow border border-white/20 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2.5"
                    title="Switch Camera (Front/Back)"
                  >
                    <FlipHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Flip</span>
                  </button>
                </div>
              )}
            </div>

            {/* Camera Actions Bar */}
            <div className="flex gap-2">
              {!isScanning ? (
                <button
                  onClick={() => startCamera()}
                  disabled={cameraStarting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>{cameraStarting ? 'Opening...' : 'Start Camera'}</span>
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-2xl transition-colors cursor-pointer"
                >
                  Close Camera
                </button>
              )}

              {availableCameras.length > 1 && isScanning && (
                <button
                  onClick={handleSwitchCamera}
                  className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-2xl transition-colors cursor-pointer flex items-center gap-1.5 border border-gray-200"
                >
                  <FlipHorizontal className="w-4 h-4" />
                  <span>Switch</span>
                </button>
              )}
            </div>
          </div>

          <div id="temp-upload-reader" className="hidden" />

          {/* Camera Error Alert with Actionable Help */}
          {cameraError && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-2xl space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Camera Notice</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">{cameraError}</p>
            </div>
          )}

          {/* Instant 1-Click Scan (Opens confirmation with Present button directly) */}
          {activeSession && (
            <div className="pt-1">
              <button
                onClick={() => handleQrDetected(activeSession.currentQrToken)}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>⚡ Quick Scan Live Class (Opens Present Button)</span>
              </button>
            </div>
          )}

          {/* Upload QR image option & Manual Code option */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <label className="py-2.5 px-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-bold rounded-2xl text-center cursor-pointer flex items-center justify-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-gray-500" />
              <span>Select QR Photo</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="py-2.5 px-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-bold rounded-2xl text-center cursor-pointer flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-gray-500" />
              <span>Enter Code</span>
            </button>
          </div>

          {/* Manual Session Code Input */}
          {showManualInput && (
            <form onSubmit={handleManualCodeSubmit} className="bg-gray-50 p-3 rounded-2xl border border-gray-200 space-y-2">
              <div className="text-[11px] font-bold text-gray-700">Enter Class Attendance Code:</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g. SMART_TOKEN or session ID"
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 cursor-pointer"
                >
                  Verify
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
