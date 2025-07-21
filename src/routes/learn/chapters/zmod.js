export default `
# ZMod

ZMod (Zen Modular) lets you build your own modular synth patches using a simple JavaScript API. It works like a rack of connected sound modules—oscillators, filters, effects, etc.

## Basic Usage

Set the \`inst\` to \`zmod\` and provide a patch string using ZMod syntax:

\`\`\`js
s0.set({ inst: 'zmod', patch: 'sine(100).amp(0.5).pan(0.5)' })
s0.e.every(16)
\`\`\`

### Parameters

The example above plays a constant drone. You can control its parameters with signals. \`sig\` takes a name and an optional default value:

\`\`\`js
s0.set({ inst: 'zmod', patch: "sine(sig('freq', 100)).amp(sig('amp')).pan(sig('pan'))" })
\`\`\`

Now you can update parameters live on the stream:

\`\`\`js
s0.freq.set('100 200 300 400')
s0.amp.set(0.5)
s0.pan.saw()
\`\`\`

### Shorthand

Use a \`#\` prefix instead of \`sig\` for simpler code:

\`\`\`js
s0.set({ inst: 'zmod', patch: 'sine(#freq).amp(#amp).pan(#pan)' })
s0.freq.set('100 200 300 400')
s0.amp.set(0.5)
s0.pan.saw()
s0.e.every(4)
\`\`\`

### Notes

Use \`#n\` for note values wherever you would supply a frequency. It will automatically convert midi note numbers to Hz:

\`\`\`js
s0.set({ inst: 'zmod', patch: 'sine(#n).amp(0.5).pan()' })
s0.n.set('Ddor%16..*16')
s0.e.every(1)
\`\`\`

### Envelopes

Use \`#e\` to create an envelope, which will be triggered by the stream's \`e\` parameter:
\`\`\`js
s0.set({ inst: 'zmod', patch: 'sine(#n).amp(#e).pan()'})
s0.n.set('Ddor%16..*16')
s0.e.set('3:8')
\`\`\`

This automatically maps the \`a\`, \`d\`, \`s\`, and \`r\` parameters to the envelope's attack, decay, sustain, and release times:
\`\`\`js
s0.set({ inst: 'zmod', patch: 'sine(#n).amp(#e).pan()'})
s0.n.set('Ddor%16..*16')
s0.a.set('100')
s0.d.set('100')
s0.s.set('0.5')
s0.r.set('1000')
s0.e.set('3:8')
\`\`\`

Need more envelopes? Use \`#e1\`, \`#e2\`, etc. to create additional envelopes. These map to \`a1\`, \`d1\`, \`s1\`, \`r1\`, and \`a2\`, \`d2\`, \`s2\`, and \`r2\`, etc.
\`\`\`js
const patch = \`
  saw(#n).amp(#e).pan()
    .reverb(0.75,5000)
    .lpf(#e1.scale(50,5000),.9)
\`

s0.set({ inst: 'zmod', patch, a: 10, a1: 500, s1:0.1, r1:0})
s0.n.set('Ddor%8..*16')
s0.e.set('3:8')
\`\`\`

## API
There are two main types of signal in ZMod: \`ControlSignal\` and \`AudioSignal\`. \`ControlSignals\`, including LFOs and Envelopes, can usually be passed to any \`AudioSignal\` method where a number is expected.

### Signals

\`sig(value: number): ControlSignal\`

Creates a new \`ControlSignal\` with the specified value.

#### Signal Operators 

These methods can be applied to a \`ControlSignal\`, and passed one or more \`number\` arguments:

\`\`\`ts
ControlSignal.fn(...args: number[]): ControlSignal
\`\`\`

Available functions:

* \`abs\`
* \`add\`
* \`multiply\`
* \`subtract\`
* \`greaterthan\`
* \`greaterthanzero\`
* \`negate\`
* \`gaintoaudio\`
* \`audiotogain\`
* \`pow\`
* \`scale\`
* \`scaleexp\`

\`\`\`ts
sine(lfo(0.5,100,200).multiply(2))
\`\`\`

### LFOs
Generates a \`ControlSignal\` that oscillates between the specified minimum and maximum values at the specified frequency.
\`\`\`ts
(frequency: ControlSignal, min: number = 0, max: number = 1): ControlSignal
\`\`\`

* \`lfo\`
* \`lfosine\`
* \`lfotri\`
* \`lfosquare\`
* \`lfosaw\`

### Envelope
Creates a \`ControlSignal\` controlled by an ADSR envelope (all time values in milliseconds).

\`\`\`ts
adsr(attack?: number, decay?: number, sustain?: number, release?: number): ControlSignal
\`\`\`

\`\`\`ts
sine(100).amp(adsr())
\`\`\`

Envelopes must be triggered from outside the patch. See Basic Usage above.

### Oscillators

#### Basic Waveforms
All oscillators generate an \`AudioSignal\` at the specified frequency. The frequency can be a \`ControlSignal\` or a number.

\`\`\`ts
(freq: ControlSignal = 220): AudioSignal
\`\`\`

* \`sine\`
* \`tri\`
* \`square\`
* \`saw\`

\`\`\`ts
sine(100)
\`\`\`

#### FM Oscillators
Frequency Modulation (FM) oscillators allow for complex timbres by modulating the frequency of a carrier wave with another signal. The \`harm\` parameter controls the harmonicity ratio (pitch relationship between the two oscillators), and \`modi\` controls the modulation index (amplitude of the modulator oscillator).

\`\`\`ts
(freq: ControlSignal = 220, harm: ControlSignal = 1, modi: ControlSignal = 1): AudioSignal
\`\`\`

* \`fm\`
* \`fmsine\`
* \`fmtri\`
* \`fmsquare\`
* \`fmsaw\`

\`\`\`ts
fmsaw(
    100,
    lfosaw(0.5,0.5,10),
    lfosine(0.25,1,10)
)
\`\`\`

#### AM Oscillators
Amplitude Modulation (AM) oscillators modulate the amplitude of a carrier wave with another signal. The \`harm\` parameter controls the harmonicity ratio, similar to FM oscillators.

\`\`\`ts
(freq: ControlSignal = 220, harm: ControlSignal = 1): AudioSignal
\`\`\`

* \`am\`
* \`amsine\`
* \`amtri\`
* \`amsquare\`
* \`amsaw\`

\`\`\`ts
fmsaw(
    lfosaw(0.125,100,1000),
    lfosaw(0.5,0.5,10),
    lfosine(0.25,1,10)
)
\`\`\`

#### Pulse
A pulse wave is a square wave with a variable duty cycle, controlled by the \`width\` parameter (0 to 1). A width of 0.5 produces a standard square wave.

\`\`\`ts
pulse(freq: ControlSignal, width: ControlSignal): AudioSignal
\`\`\`
\`\`\`ts
pulse(100, 0.5)
\`\`\`

#### PWM
Pulse Width Modulation (PWM) oscillators modulate the width of a pulse wave with another signal, typically an LFO. The \`modFreq\` parameter controls the frequency of the modulation.
\`\`\`ts
pwm(freq: ControlSignal, modFreq: ControlSignal): AudioSignal
\`\`\`

\`\`\`ts
pwm(100, lfo(0.125,0.5,2))
\`\`\`

#### Fat Oscillators
Fat oscillators are designed to produce a richer sound by combining multiple oscillators. The \`spread\` parameter controls the detuning between the oscillators, creating a thicker sound.

\`\`\`ts
(freq: ControlSignal = 220, spread: number = 10): AudioSignal
\`\`\`

* \`fat\`
* \`fatsine\`
* \`fattri\`
* \`fatsquare\`
* \`fatsaw\`

### Noise
Noise generators from bright to dark:

\`\`\`ts
(): AudioSignal
\`\`\`

* \`white\`
* \`pink\`
* \`brown\`

### Modifiers

#### amp
\`\`\`ts
AudioSignal.amp(value: ControlSignal): Gain
\`\`\`

Controls the amplitude of the signal. The value can be a \`ControlSignal\` or a number.

\`\`\`ts
sine(100).amp(lfo())
\`\`\`

### Filters
Control the frequency content of the signal. All filters take a \`frequency\` parameter, which can be a \`ControlSignal\` or a number. The \`q\` parameter controls the resonance, and \`rolloff\` controls the filter's roll-off rate.

\`\`\`ts
saw(100).lpf(lfo(0.5,100,2000), 0.5, '12')
\`\`\`

#### hpf
High-pass filter.

\`\`\`ts
AudioSignal.hpf(frequency?: ControlSignal, q?: ControlSignal, rolloff?: FilterRollOff): AudioSignal
\`\`\`


#### lpf
Low-pass filter.

\`\`\`ts
AudioSignal.lpf(frequency?: ControlSignal, q?: ControlSignal, rolloff?: FilterRollOff): AudioSignal
\`\`\`


#### bpf
Band-pass filter.

\`\`\`ts
AudioSignal.bpf(frequency?: ControlSignal, q?: ControlSignal, rolloff?: FilterRollOff): AudioSignal
\`\`\`


#### fbf
Feedback comb filter.

\`\`\`ts
AudioSignal.fbf(delayTime?: ControlSignal, resonance?: ControlSignal): AudioSignal
\`\`\`


### Effects

#### reverb
Reverb effect.

\`\`\`ts
AudioSignal.reverb(wet?: ControlSignal, decay?: ControlSignal): AudioSignal
\`\`\`


#### delay
Feedback delay effect.

\`\`\`ts
AudioSignal.delay(wet?: ControlSignal, delayTime?: ControlSignal, feedback?: ControlSignal): AudioSignal
\`\`\`


#### dist
Distortion effect.

\`\`\`ts
AudioSignal.dist(wet?: ControlSignal, distortion?: ControlSignal): AudioSignal
\`\`\`


#### chorus
Chorus effect.

\`\`\`ts
AudioSignal.chorus(wet?: ControlSignal, frequency?: ControlSignal, feedback?: ControlSignal, depth?: ControlSignal): AudioSignal
\`\`\`


### Metering

#### follow
Envelope follower. In this example, we use the amplitude of the signal in the left channel to modulate the pitch of signal in the right channel.

\`\`\`ts
stack(
    sine(100).amp(lfo()).out(0),
    sine(out(0).follow().multiply(1000).add(100)).amp(0.5).out(1),
)
\`\`\`

### Routing

#### pan
\`\`\`ts
AudioSignal.pan(value?: ControlSignal): AudioSignal
\`\`\`

Stereo panner. Values between 0 and 1. Converts the signal to stereo.

\`\`\`ts
fm(100).pan(lfo())
\`\`\`

#### bus
When used as method, routes the signal to a bus.
\`\`\`ts
AudioSignal.bus(index: number): AudioSignal
\`\`\`

When used as a function, routes the signal from a bus. A 10ms delay is applied to prevent feedback.
\`\`\`ts
bus(index: number): AudioSignal
\`\`\`

`