import { useState, useEffect, useCallback, useRef } from 'react'
import { PlayIcon, PauseIcon, ArrowPathIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline'

const MATCH_PRESETS = {
  SENIOR_KUMITE: { name: 'Senior Kumite', time: 180 }, // 3 minutes
  CADET_KUMITE: { name: 'Cadet Kumite', time: 120 }, // 2 minutes
  KATA: { name: 'Kata', time: 300 }, // 5 minutes
  TEAM_KATA: { name: 'Team Kata', time: 360 }, // 6 minutes
  CUSTOM: { name: 'Custom', time: 180 }
}

const Timer = () => {
  const [selectedPreset, setSelectedPreset] = useState('SENIOR_KUMITE')
  const [time, setTime] = useState(MATCH_PRESETS.SENIOR_KUMITE.time)
  const [isRunning, setIsRunning] = useState(false)
  const [warnings, setWarnings] = useState({ aka: 0, ao: 0 })
  const [points, setPoints] = useState({ aka: 0, ao: 0 })
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const audioContext = useRef(null)

  // Initialize Web Audio API
  useEffect(() => {
    audioContext.current = new (window.AudioContext || window.webkitAudioContext)()
    return () => {
      if (audioContext.current) {
        audioContext.current.close()
      }
    }
  }, [])

  const playBeep = (frequency = 440, duration = 0.2, type = 'sine') => {
    if (!isSoundEnabled || !audioContext.current) return

    const oscillator = audioContext.current.createOscillator()
    const gainNode = audioContext.current.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.current.destination)

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, audioContext.current.currentTime)

    gainNode.gain.setValueAtTime(1, audioContext.current.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + duration)

    oscillator.start(audioContext.current.currentTime)
    oscillator.stop(audioContext.current.currentTime + duration)
  }

  // Timer logic
  useEffect(() => {
    let interval
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false)
            setShowEndDialog(true)
            playBeep(880, 0.5, 'square') // End match sound
            return 0
          }
          if (prevTime <= 11) {
            playBeep(440, 0.1) // Last 10 seconds countdown
          }
          return prevTime - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, time])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const toggleTimer = () => {
    if (!isRunning && audioContext.current?.state === 'suspended') {
      audioContext.current.resume()
    }
    setIsRunning(!isRunning)
  }

  const resetTimer = (presetKey = selectedPreset) => {
    setTime(MATCH_PRESETS[presetKey].time)
    setIsRunning(false)
    setWarnings({ aka: 0, ao: 0 })
    setPoints({ aka: 0, ao: 0 })
    setShowEndDialog(false)
    setSelectedPreset(presetKey)
  }

  const addWarning = (competitor) => {
    setWarnings(prev => {
      const newWarnings = {
        ...prev,
        [competitor]: prev[competitor] + 1
      }
      if (newWarnings[competitor] >= 2) {
        playBeep(660, 0.3, 'square')
      }
      return newWarnings
    })
  }

  const updatePoints = (competitor, value) => {
    setPoints(prev => {
      const newPoints = {
        ...prev,
        [competitor]: Math.max(0, prev[competitor] + value)
      }
      if (value > 0) playBeep(550, 0.1)
      return newPoints
    })
  }

  const handleKeyPress = useCallback((e) => {
    switch (e.code) {
      case 'Space':
        e.preventDefault()
        toggleTimer()
        break
      case 'KeyR':
        resetTimer()
        break
      case 'Digit1':
        if (e.shiftKey) updatePoints('aka', 1)
        else if (e.ctrlKey || e.metaKey) updatePoints('ao', 1)
        break
      case 'KeyW':
        if (e.shiftKey) addWarning('aka')
        else if (e.ctrlKey || e.metaKey) addWarning('ao')
        break
      default:
        break
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="p-4 bg-gray-700 flex items-center justify-between">
            <div className="flex gap-2">
              {Object.entries(MATCH_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => resetTimer(key)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${selectedPreset === key
                    ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className={`p-2 rounded-full ${isSoundEnabled ? 'text-green-400 hover:bg-green-900/50' : 'text-red-400 hover:bg-red-900/50'
                }`}
            >
              {isSoundEnabled ? (
                <SpeakerWaveIcon className="h-6 w-6" />
              ) : (
                  <SpeakerXMarkIcon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Main Timer Display */}
          <div className="p-8 bg-gradient-to-br from-gray-900 to-gray-800">
            <div className={`text-center mb-8 ${time <= 10 && time > 0 ? 'animate-pulse' : ''
              }`}>
              <div className={`text-8xl font-digital mb-2 ${time <= 10 ? 'text-red-500' : 'text-cyan-400'
                }`}>
                {formatTime(time)}
              </div>
              <div className="text-sm text-gray-400">OFFICIAL KARATE TIMER</div>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center gap-4 mb-12">
              <button
                onClick={toggleTimer}
                className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-transform ${isRunning
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
                  }`}
              >
                {isRunning ? (
                  <>
                    <PauseIcon className="h-6 w-6" />
                    Pause
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-6 w-6" />
                    Start
                  </>
                )}
              </button>
              <button
                onClick={() => resetTimer()}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-xl font-bold flex items-center gap-2"
              >
                <ArrowPathIcon className="h-6 w-6" />
                Reset
              </button>
            </div>

            {/* Scoreboards */}
            <div className="grid grid-cols-2 gap-8">
              {/* AKA Section */}
              <div className={`p-6 rounded-xl transition-all ${warnings.aka >= 2 ? 'bg-red-900/50' : 'bg-red-900/30'
                }`}>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-red-500 mb-2">AKA</div>
                  <div className="text-6xl font-digital">{points.aka}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => updatePoints('aka', 1)}
                    className="py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold"
                  >
                    +1 POINT
                  </button>
                  <button
                    onClick={() => updatePoints('aka', -1)}
                    className="py-2 bg-red-800 hover:bg-red-900 rounded-lg"
                  >
                    -1 POINT
                  </button>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => addWarning('aka')}
                    className={`w-full py-2 rounded-lg font-bold ${warnings.aka >= 2
                      ? 'bg-red-800 text-red-200'
                      : 'bg-red-600 hover:bg-red-700'
                      }`}
                  >
                    WARNINGS ({warnings.aka})
                  </button>
                </div>
              </div>

              {/* AO Section */}
              <div className={`p-6 rounded-xl transition-all ${warnings.ao >= 2 ? 'bg-blue-900/50' : 'bg-blue-900/30'
                }`}>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-blue-400 mb-2">AO</div>
                  <div className="text-6xl font-digital">{points.ao}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => updatePoints('ao', 1)}
                    className="py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
                  >
                    +1 POINT
                  </button>
                  <button
                    onClick={() => updatePoints('ao', -1)}
                    className="py-2 bg-blue-800 hover:bg-blue-900 rounded-lg"
                  >
                    -1 POINT
                  </button>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => addWarning('ao')}
                    className={`w-full py-2 rounded-lg font-bold ${warnings.ao >= 2
                      ? 'bg-blue-800 text-blue-200'
                      : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                  >
                    WARNINGS ({warnings.ao})
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Match End Dialog */}
          {showEndDialog && (
            <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4">
              <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full">
                <h3 className="text-2xl font-bold text-center mb-6">MATCH ENDED</h3>
                <div className="text-center mb-8">
                  <div className="text-xl font-semibold mb-4">
                    Winner: {' '}
                    <span className={`text-3xl ${points.aka > points.ao
                      ? 'text-red-500'
                      : points.ao > points.aka
                        ? 'text-blue-400'
                        : 'text-yellow-400'
                      }`}>
                      {points.aka > points.ao ? 'AKA' : points.ao > points.aka ? 'AO' : 'DRAW'}
                    </span>
                  </div>
                  <div className="text-lg">
                    AKA {points.aka} - {points.ao} AO
                  </div>
                </div>
                <button
                  onClick={() => resetTimer()}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl font-bold"
                >
                  START NEW MATCH
                </button>
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts */}
          <div className="p-4 bg-gray-700/50">
            <div className="text-center text-sm text-gray-400">
              Keyboard Shortcuts: Space=Start/Pause, R=Reset, Shift+1=AKA Point, Ctrl+1=AO Point
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Timer