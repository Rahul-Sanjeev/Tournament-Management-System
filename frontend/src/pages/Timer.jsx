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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Match Type Selection */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex flex-wrap gap-2">
            {Object.entries(MATCH_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => resetTimer(key)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${selectedPreset === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {preset.name}
              </button>
            ))}
            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className={`ml-auto px-3 py-1 rounded text-sm font-medium transition-colors ${isSoundEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
            >
              {isSoundEnabled ? (
                <SpeakerWaveIcon className="h-5 w-5" />
              ) : (
                <SpeakerXMarkIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Timer Display */}
        <div className="p-8 text-center">
          <div className={`text-6xl font-mono font-bold mb-8 ${time <= 10 && time > 0 ? 'text-red-600 animate-pulse' : ''
            }`}>
            {formatTime(time)}
          </div>

          {/* Timer Controls */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={toggleTimer}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${isRunning
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
                }`}
            >
              {isRunning ? (
                <>
                  <PauseIcon className="h-5 w-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Start
                </>
              )}
            </button>
            <button
              onClick={() => resetTimer()}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Reset
            </button>
          </div>

          {/* Scoreboard */}
          <div className="grid grid-cols-2 gap-8">
            {/* AKA */}
            <div className={`space-y-4 p-4 rounded-lg ${warnings.aka >= 2 ? 'bg-red-50' : ''}`}>
              <div className="text-2xl font-bold text-red-600">AKA</div>
              <div className="text-4xl font-bold">{points.aka}</div>
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => updatePoints('aka', 1)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  title="Shift + 1"
                >
                  +1
                </button>
                <button
                  onClick={() => updatePoints('aka', -1)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  -1
                </button>
              </div>
              <div>
                <button
                  onClick={() => addWarning('aka')}
                  className={`px-3 py-1 rounded hover:bg-yellow-200 ${warnings.aka >= 2
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                    }`}
                  title="Shift + W"
                >
                  Warning ({warnings.aka})
                </button>
              </div>
            </div>

            {/* AO */}
            <div className={`space-y-4 p-4 rounded-lg ${warnings.ao >= 2 ? 'bg-red-50' : ''}`}>
              <div className="text-2xl font-bold text-blue-600">AO</div>
              <div className="text-4xl font-bold">{points.ao}</div>
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => updatePoints('ao', 1)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  title="Ctrl/Cmd + 1"
                >
                  +1
                </button>
                <button
                  onClick={() => updatePoints('ao', -1)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  -1
                </button>
              </div>
              <div>
                <button
                  onClick={() => addWarning('ao')}
                  className={`px-3 py-1 rounded hover:bg-yellow-200 ${warnings.ao >= 2
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                    }`}
                  title="Ctrl/Cmd + W"
                >
                  Warning ({warnings.ao})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Match End Dialog */}
        {showEndDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <h3 className="text-lg font-bold mb-4">Match Ended</h3>
              <div className="text-center mb-4">
                <div className="text-xl">
                  Winner:{' '}
                  <span className={`font-bold ${points.aka > points.ao ? 'text-red-600' :
                      points.ao > points.aka ? 'text-blue-600' : ''
                    }`}>
                    {points.aka > points.ao
                      ? 'AKA'
                      : points.ao > points.aka
                        ? 'AO'
                        : 'DRAW'}
                  </span>
                </div>
                <div className="mt-2">
                  Final Score: AKA {points.aka} - {points.ao} AO
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => resetTimer()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  New Match
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Info */}
        <div className="bg-gray-50 px-4 py-3 text-sm text-gray-500">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>General:</strong>
              <ul>
                <li>Space - Start/Pause</li>
                <li>R - Reset</li>
              </ul>
            </div>
            <div>
              <strong>Scoring:</strong>
              <ul>
                <li>Shift + 1 - Point for AKA</li>
                <li>Ctrl/Cmd + 1 - Point for AO</li>
                <li>Shift + W - Warning for AKA</li>
                <li>Ctrl/Cmd + W - Warning for AO</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Timer