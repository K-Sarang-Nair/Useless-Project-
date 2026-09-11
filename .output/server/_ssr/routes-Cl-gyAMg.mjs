import { n as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Cl-gyAMg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Bear({ expression, gait, facing, reaching, silhouette, action = "none", glowEyes }) {
	const browAngle = expression === "furious" || expression === "roar" ? 30 : expression === "angry" ? 20 : expression === "sleepy" ? 4 : 12;
	const eyeH = expression === "sleepy" ? 1.6 : expression === "sneaky" ? 2.2 : 5;
	const eyeFill = glowEyes ? "var(--glow)" : "var(--bear-nose)";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `bear bear--${gait} ${action !== "none" ? `bear-act--${action}` : ""} ${silhouette ? "bear--dark" : ""} ${glowEyes ? "bear--glow" : ""}`,
		style: { transform: `scaleX(${facing})` },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 120 150",
			width: "100%",
			height: "100%",
			"aria-hidden": "true",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
					className: "bear-leg bear-leg--back",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "42",
						y: "104",
						width: "16",
						height: "34",
						rx: "8",
						fill: "var(--bear-dark)"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
					className: "bear-leg bear-leg--front",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "64",
						y: "104",
						width: "16",
						height: "34",
						rx: "8",
						fill: "var(--bear-fur)"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
					cx: "61",
					cy: "92",
					rx: "32",
					ry: "30",
					fill: "var(--bear-fur)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
					cx: "63",
					cy: "98",
					rx: "18",
					ry: "16",
					fill: "var(--bear-belly)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
					className: `bear-arm bear-arm--back`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "28",
						y: "72",
						width: "15",
						height: "32",
						rx: "7.5",
						fill: "var(--bear-dark)"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
					className: "bear-arm bear-arm--front",
					style: reaching ? { transform: "rotate(-72deg)" } : void 0,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "78",
						y: "72",
						width: "15",
						height: "34",
						rx: "7.5",
						fill: "var(--bear-fur)"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: "bear-head",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "42",
							cy: "44",
							r: "11",
							fill: "var(--bear-fur)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "42",
							cy: "44",
							r: "5",
							fill: "var(--bear-inner)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "84",
							cy: "44",
							r: "11",
							fill: "var(--bear-fur)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "84",
							cy: "44",
							r: "5",
							fill: "var(--bear-inner)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
							cx: "63",
							cy: "55",
							rx: "30",
							ry: "27",
							fill: "var(--bear-fur)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
							cx: "66",
							cy: "64",
							rx: "15",
							ry: "11",
							fill: "var(--bear-snout)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
							cx: "68",
							cy: "60",
							rx: "5",
							ry: "3.6",
							fill: "var(--bear-nose)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
							className: "bear-eye",
							cx: "53",
							cy: "50",
							rx: "4",
							ry: eyeH,
							fill: eyeFill
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
							className: "bear-eye",
							cx: "74",
							cy: "50",
							rx: "4",
							ry: eyeH,
							fill: eyeFill
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
							x: "45",
							y: "40",
							width: "16",
							height: "3.6",
							rx: "1.8",
							fill: "var(--bear-nose)",
							transform: `rotate(${browAngle} 53 42)`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
							x: "66",
							y: "40",
							width: "16",
							height: "3.6",
							rx: "1.8",
							fill: "var(--bear-nose)",
							transform: `rotate(${-browAngle} 74 42)`
						}),
						expression === "roar" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
							className: "bear-roar-mouth",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
									cx: "66",
									cy: "72",
									rx: "11",
									ry: "9",
									fill: "var(--bear-nose)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
									d: "M58 68 l3 5 l3 -5 z",
									fill: "var(--bear-belly)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
									d: "M70 68 l3 5 l3 -5 z",
									fill: "var(--bear-belly)"
								})
							]
						}) : expression === "sleepy" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
							cx: "66",
							cy: "72",
							rx: "6",
							ry: "7",
							fill: "var(--bear-nose)",
							opacity: "0.85"
						}) : expression === "silly" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M56 71 q10 9 20 0",
							stroke: "var(--bear-nose)",
							strokeWidth: "3",
							fill: "none",
							strokeLinecap: "round"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M56 74 q10 -8 20 0",
							stroke: "var(--bear-nose)",
							strokeWidth: "3",
							fill: "none",
							strokeLinecap: "round"
						})
					]
				}),
				(expression === "furious" || expression === "roar") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: "bear-steam",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "26",
						cy: "26",
						r: "5",
						fill: "var(--bear-belly)",
						opacity: "0.5"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "98",
						cy: "22",
						r: "6",
						fill: "var(--bear-belly)",
						opacity: "0.4"
					})]
				})
			]
		})
	});
}
var ctx = null;
var master = null;
var ambientStarted = false;
var audio = { muted: false };
function ac() {
	if (typeof window === "undefined") return null;
	if (!ctx) {
		const Ctor = window.AudioContext || window.webkitAudioContext;
		if (!Ctor) return null;
		ctx = new Ctor();
		master = ctx.createGain();
		master.gain.value = .9;
		master.connect(ctx.destination);
	}
	if (ctx.state === "suspended") ctx.resume();
	return ctx;
}
function setMuted(m) {
	audio.muted = m;
	if (master) master.gain.value = m ? 0 : .9;
}
function unlockAudio() {
	if (ac() && !ambientStarted) {
		ambientStarted = true;
		startAmbient();
	}
}
function noiseBuffer(c, seconds) {
	const buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
	const data = buf.getChannelData(0);
	for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
	return buf;
}
function env(g, c, peak, attack, decay) {
	const t = c.currentTime;
	g.gain.setValueAtTime(1e-4, t);
	g.gain.exponentialRampToValueAtTime(Math.max(peak, 2e-4), t + attack);
	g.gain.exponentialRampToValueAtTime(1e-4, t + attack + decay);
}
function tone(freq, dur, type = "sine", gain = .2, slideTo) {
	const c = ac();
	if (!c || !master) return;
	const o = c.createOscillator();
	const g = c.createGain();
	o.type = type;
	o.frequency.setValueAtTime(freq, c.currentTime);
	if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur);
	env(g, c, gain, .01, dur);
	o.connect(g).connect(master);
	o.start();
	o.stop(c.currentTime + dur + .05);
}
function noise(dur, gain, filterType, freq, q = 1) {
	const c = ac();
	if (!c || !master) return;
	const src = c.createBufferSource();
	src.buffer = noiseBuffer(c, Math.max(dur, .05));
	const f = c.createBiquadFilter();
	f.type = filterType;
	f.frequency.value = freq;
	f.Q.value = q;
	const g = c.createGain();
	env(g, c, gain, .005, dur);
	src.connect(f).connect(g).connect(master);
	src.start();
	src.stop(c.currentTime + dur + .05);
}
function startAmbient() {
	const c = ac();
	if (!c || !master) return;
	const src = c.createBufferSource();
	src.buffer = noiseBuffer(c, 4);
	src.loop = true;
	const f = c.createBiquadFilter();
	f.type = "lowpass";
	f.frequency.value = 220;
	const g = c.createGain();
	g.gain.value = .035;
	src.connect(f).connect(g).connect(master);
	src.start();
}
var sfx = {
	ropePull() {
		noise(.18, .12, "bandpass", 900, 2);
	},
	switchClick() {
		tone(1600, .04, "square", .15, 700);
		noise(.05, .2, "highpass", 2500);
	},
	buzz(dur = .25) {
		tone(120, dur, "sawtooth", .05);
		tone(60, dur, "square", .03);
	},
	flick() {
		noise(.06, .12, "bandpass", 3e3, 3);
	},
	creak() {
		const c = ac();
		if (!c || !master) return;
		const o = c.createOscillator();
		const g = c.createGain();
		o.type = "sawtooth";
		o.frequency.setValueAtTime(70, c.currentTime);
		o.frequency.linearRampToValueAtTime(190, c.currentTime + 1.6);
		const f = c.createBiquadFilter();
		f.type = "bandpass";
		f.frequency.value = 500;
		f.Q.value = 6;
		const lfo = c.createOscillator();
		const lfoGain = c.createGain();
		lfo.frequency.value = 7;
		lfoGain.gain.value = .05;
		lfo.connect(lfoGain).connect(g.gain);
		g.gain.setValueAtTime(.09, c.currentTime);
		g.gain.setValueAtTime(.09, c.currentTime + 1.4);
		g.gain.linearRampToValueAtTime(1e-4, c.currentTime + 1.8);
		o.connect(f).connect(g).connect(master);
		o.start();
		lfo.start();
		o.stop(c.currentTime + 1.9);
		lfo.stop(c.currentTime + 1.9);
	},
	step(heavy = false) {
		noise(heavy ? .16 : .09, heavy ? .28 : .12, "lowpass", heavy ? 180 : 320);
		if (heavy) tone(70, .12, "sine", .2, 40);
	},
	grunt(pitch = 220) {
		tone(pitch, .22, "sawtooth", .09, pitch * .6);
	},
	yawn() {
		tone(300, .7, "sine", .07, 160);
	},
	boing() {
		tone(200, .35, "triangle", .14, 900);
	},
	dance() {
		[
			523,
			659,
			784,
			659
		].forEach((f, i) => setTimeout(() => tone(f, .12, "square", .08), i * 130));
	},
	slam() {
		noise(.5, .9, "lowpass", 300);
		tone(90, .5, "sine", .6, 35);
		tone(180, .25, "square", .25, 50);
	},
	growl(dur = 1.2) {
		tone(58, dur, "sawtooth", .09, 44);
		tone(88, dur * .8, "square", .04, 60);
		noise(dur * .7, .05, "lowpass", 220);
	},
	sniff() {
		noise(.12, .07, "highpass", 1800);
		setTimeout(() => noise(.1, .06, "highpass", 2200), 190);
	},
	roar() {
		tone(120, .7, "sawtooth", .13, 70);
		tone(240, .5, "square", .06, 110);
		noise(.6, .14, "lowpass", 700);
	},
	sting() {
		tone(1300, .5, "sawtooth", .05, 1900);
		tone(1900, .5, "square", .03, 2600);
	},
	whoosh() {
		noise(.3, .14, "bandpass", 800, 1.2);
	},
	jump() {
		tone(220, .22, "triangle", .12, 700);
		noise(.12, .1, "lowpass", 400);
	},
	land() {
		noise(.22, .3, "lowpass", 200);
		tone(80, .2, "sine", .28, 40);
	},
	blow() {
		noise(.7, .16, "bandpass", 600, .7);
	},
	pop() {
		tone(900, .08, "square", .12, 200);
		noise(.08, .12, "highpass", 3e3);
	},
	clang() {
		tone(1400, .35, "square", .07, 500);
		tone(2100, .25, "triangle", .05, 900);
		noise(.2, .08, "highpass", 2500);
	},
	spring() {
		[
			420,
			520,
			380,
			600
		].forEach((f, i) => setTimeout(() => tone(f, .1, "triangle", .07, f * 1.6), i * 90));
	}
};
var ROPE_X = 78;
var DOOR_X = 50;
var OFFSTAGE_X = 50;
var PULL_THRESHOLD = 55;
var wait = (ms) => new Promise((r) => setTimeout(r, ms));
var TAUNTS = [
	{
		at: 3,
		text: "He heard that."
	},
	{
		at: 5,
		text: "He is starting to get annoyed."
	},
	{
		at: 8,
		text: "He was having a nice nap, you know."
	},
	{
		at: 10,
		text: "Bro. Stop turning it on."
	},
	{
		at: 15,
		text: "The bear has begun taking notes."
	},
	{
		at: 20,
		text: "You have learned absolutely nothing."
	},
	{
		at: 30,
		text: "Neither of you will win this."
	},
	{
		at: 50,
		text: "This is your life now."
	},
	{
		at: 75,
		text: "He respects your commitment. Slightly."
	},
	{
		at: 100,
		text: "One hundred. The bear has moved in permanently."
	}
];
function UselessProject() {
	const [phase, setPhase] = (0, import_react.useState)("IDLE");
	const [lightOn, setLightOn] = (0, import_react.useState)(false);
	const [doorState, setDoorState] = (0, import_react.useState)("closed");
	const [eyes, setEyes] = (0, import_react.useState)(false);
	const [peek, setPeek] = (0, import_react.useState)("none");
	const [shake, setShake] = (0, import_react.useState)(false);
	const [muted, setMutedState] = (0, import_react.useState)(false);
	const [everPulled, setEverPulled] = (0, import_react.useState)(false);
	const [ropeDrag, setRopeDrag] = (0, import_react.useState)(0);
	const [swing, setSwing] = (0, import_react.useState)(false);
	const [bearVisible, setBearVisible] = (0, import_react.useState)(false);
	const [bearX, setBearX] = (0, import_react.useState)(OFFSTAGE_X);
	const [bearDur, setBearDur] = (0, import_react.useState)(0);
	const [gait, setGait] = (0, import_react.useState)("idle");
	const [expr, setExpr] = (0, import_react.useState)("angry");
	const [facing, setFacing] = (0, import_react.useState)(1);
	const [reaching, setReaching] = (0, import_react.useState)(false);
	const [beam, setBeam] = (0, import_react.useState)(false);
	const [bearDark, setBearDark] = (0, import_react.useState)(false);
	const [action, setAction] = (0, import_react.useState)("none");
	const [projectile, setProjectile] = (0, import_react.useState)(null);
	const [puff, setPuff] = (0, import_react.useState)(false);
	const [stats, setStats] = (0, import_react.useState)({
		lights: 0,
		appearances: 0,
		defeats: 0,
		slams: 0
	});
	const [taunt, setTaunt] = (0, import_react.useState)("");
	const dragging = (0, import_react.useRef)(false);
	const startY = (0, import_react.useRef)(0);
	const stepTimer = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => () => void (stepTimer.current && clearInterval(stepTimer.current)), []);
	const updateStatistics = (0, import_react.useCallback)((key) => {
		setStats((s) => ({
			...s,
			[key]: s[key] + 1
		}));
	}, []);
	const footsteps = (interval, heavy = false) => {
		if (stepTimer.current) clearInterval(stepTimer.current);
		stepTimer.current = setInterval(() => sfx.step(heavy), interval);
	};
	const stopFootsteps = () => {
		if (stepTimer.current) clearInterval(stepTimer.current);
		stepTimer.current = null;
	};
	const moveTo = async (target, g, speed) => {
		const distance = Math.abs(target - bearXRef.current);
		const ms = Math.max(220, distance / speed * 1e3);
		setFacing(target >= bearXRef.current ? 1 : -1);
		setGait(g);
		setBearDur(ms);
		setBearX(target);
		bearXRef.current = target;
		footsteps(g === "run" ? 150 : g === "stomp" ? 260 : g === "sneak" ? 520 : 300, g === "stomp");
		await wait(ms);
		stopFootsteps();
		setGait("idle");
	};
	const bearXRef = (0, import_react.useRef)(OFFSTAGE_X);
	const flickerLight = async () => {
		setPhase("LIGHT_FLICKERING");
		const flickers = 4 + Math.floor(Math.random() * 3);
		for (let i = 0; i < flickers; i++) {
			setLightOn(true);
			sfx.flick();
			sfx.buzz(.12);
			await wait(40 + Math.random() * 110);
			setLightOn(false);
			await wait(50 + Math.random() * 160);
		}
		setLightOn(true);
		sfx.buzz(.5);
		setPhase("LIGHT_ON");
	};
	const openDoor = async () => {
		setPhase("DOOR_OPENING");
		sfx.creak();
		setDoorState("ajar");
		await wait(1500);
		setEyes(true);
		sfx.growl(1.4);
		await wait(1500);
		sfx.sting();
		await wait(700);
		setEyes(false);
		setPeek("in");
		sfx.creak();
		await wait(1400);
		sfx.sniff();
		await wait(1500);
		sfx.grunt(150);
		await wait(700);
		setPeek("out");
		await wait(600);
		setPeek("none");
		await wait(400);
		sfx.creak();
		setDoorState("opening");
		await wait(1800);
		setDoorState("open");
		await wait(600);
	};
	const spawnBear = (expression) => {
		setExpr(expression);
		setAction("none");
		setBearDark(false);
		setBearDur(0);
		setBearX(OFFSTAGE_X);
		bearXRef.current = OFFSTAGE_X;
		setFacing(1);
		setGait("idle");
		setBearVisible(true);
		updateStatistics("appearances");
	};
	const turnLightOff = () => {
		sfx.switchClick();
		setLightOn(false);
		setBearDark(true);
		setPhase("LIGHT_OFF");
		updateStatistics("defeats");
	};
	const bearExit = async (g = "walk", speed = 30) => {
		setPhase("BEAR_EXITING");
		setReaching(false);
		await moveTo(DOOR_X, g, speed);
		setBearVisible(false);
		await wait(200);
	};
	const slamDoor = async () => {
		setPhase("DOOR_SLAM");
		setDoorState("closed");
		sfx.slam();
		setShake(true);
		await wait(600);
		setShake(false);
		updateStatistics("slams");
	};
	const resetRoom = () => {
		setBearVisible(false);
		setBeam(false);
		setReaching(false);
		setGait("idle");
		setAction("none");
		setEyes(false);
		setPeek("none");
		setProjectile(null);
		setPuff(false);
		setRopeDrag(0);
		setSwing(true);
		setTimeout(() => setSwing(false), 2400);
		setPhase("IDLE");
	};
	const flipReach = async () => {
		setReaching(true);
		await wait(350);
		turnLightOff();
		await wait(400);
		setReaching(false);
	};
	const flipJump = async () => {
		setAction("jump");
		sfx.jump();
		await wait(300);
		turnLightOff();
		setSwing(true);
		await wait(450);
		sfx.land();
		setShake(true);
		await wait(300);
		setShake(false);
		setAction("none");
		setTimeout(() => setSwing(false), 1800);
	};
	const flipThrow = async () => {
		setFacing(1);
		setAction("throw");
		sfx.grunt(190);
		await wait(320);
		setProjectile({
			x: bearXRef.current + 3,
			fly: false
		});
		await wait(30);
		sfx.whoosh();
		setProjectile({
			x: ROPE_X,
			fly: true
		});
		await wait(430);
		sfx.clang();
		turnLightOff();
		setSwing(true);
		setProjectile(null);
		setAction("none");
		await wait(450);
		setTimeout(() => setSwing(false), 1800);
	};
	const flipBlow = async () => {
		setAction("blow");
		setPuff(true);
		sfx.blow();
		await wait(700);
		turnLightOff();
		sfx.pop();
		setPuff(false);
		setAction("none");
		await wait(400);
	};
	const flipTug = async () => {
		setReaching(true);
		setAction("tug");
		for (let i = 0; i < 3; i++) {
			sfx.spring();
			setSwing(true);
			await wait(400);
		}
		setAction("none");
		turnLightOff();
		await wait(400);
		setReaching(false);
		setTimeout(() => setSwing(false), 1800);
	};
	const flipSwipe = async () => {
		setAction("swipe");
		sfx.whoosh();
		await wait(340);
		sfx.switchClick();
		sfx.whoosh();
		await wait(340);
		turnLightOff();
		setSwing(true);
		setAction("none");
		await wait(400);
		setTimeout(() => setSwing(false), 1800);
	};
	const flipMethods = [
		flipReach,
		flipJump,
		flipThrow,
		flipBlow,
		flipTug,
		flipSwipe
	];
	const reachAndFlip = async (holdBefore = 250) => {
		await wait(holdBefore);
		await (flipMethods[Math.floor(Math.random() * flipMethods.length)] ?? flipReach)();
	};
	const behaviors = [
		{
			name: "normal",
			run: async () => {
				spawnBear("angry");
				setPhase("BEAR_ENTERING");
				setAction("look");
				await wait(1100);
				setAction("none");
				await moveTo(66, "walk", 34);
				setPhase("BEAR_ACTION");
				setAction("shake");
				sfx.grunt(200);
				await wait(900);
				setAction("none");
				await moveTo(72, "walk", 30);
				await reachAndFlip();
				await bearExit("walk", 34);
			}
		},
		{
			name: "angry charge",
			run: async () => {
				spawnBear("roar");
				setPhase("BEAR_ENTERING");
				setAction("roar");
				sfx.roar();
				await wait(900);
				setAction("none");
				setExpr("furious");
				sfx.grunt(140);
				await moveTo(72, "run", 90);
				setPhase("BEAR_ACTION");
				await reachAndFlip(80);
				sfx.grunt(120);
				await bearExit("run", 95);
			}
		},
		{
			name: "sleepy",
			run: async () => {
				spawnBear("sleepy");
				setPhase("BEAR_ENTERING");
				sfx.yawn();
				await moveTo(72, "walk", 16);
				setPhase("BEAR_ACTION");
				sfx.yawn();
				setAction("look");
				await wait(1800);
				setAction("none");
				await reachAndFlip(500);
				await bearExit("walk", 14);
			}
		},
		{
			name: "ninja",
			run: async () => {
				spawnBear("sneaky");
				setPhase("BEAR_ENTERING");
				await wait(700);
				await moveTo(58, "sneak", 18);
				setAction("sniff");
				sfx.sniff();
				await wait(1e3);
				setAction("none");
				setFacing(-1);
				await wait(600);
				setFacing(1);
				await wait(600);
				await moveTo(72, "tiptoe", 20);
				setPhase("BEAR_ACTION");
				await reachAndFlip(300);
				await bearExit("sneak", 22);
			}
		},
		{
			name: "suspicious",
			run: async () => {
				spawnBear("suspicious");
				setPhase("BEAR_ENTERING");
				await moveTo(68, "walk", 30);
				setPhase("BEAR_ACTION");
				setFacing(1);
				setAction("shake");
				await wait(900);
				setAction("none");
				setFacing(-1);
				sfx.grunt(260);
				await wait(700);
				setFacing(1);
				await wait(600);
				setFacing(-1);
				await wait(500);
				setFacing(1);
				await moveTo(72, "walk", 24);
				await reachAndFlip(300);
				await bearExit("walk", 30);
			}
		},
		{
			name: "dancing",
			run: async () => {
				spawnBear("silly");
				setPhase("BEAR_ENTERING");
				await moveTo(62, "walk", 34);
				setPhase("BEAR_ACTION");
				setGait("dance");
				sfx.dance();
				await wait(1300);
				sfx.dance();
				await wait(1300);
				setGait("idle");
				setExpr("angry");
				sfx.grunt(180);
				await wait(500);
				await moveTo(72, "hop", 42);
				await reachAndFlip(150);
				await bearExit("walk", 36);
			}
		},
		{
			name: "lazy",
			run: async () => {
				spawnBear("sleepy");
				setPhase("BEAR_ENTERING");
				await moveTo(56, "roll", 40);
				setPhase("BEAR_ACTION");
				setExpr("angry");
				await wait(500);
				setReaching(true);
				setBeam(true);
				sfx.boing();
				await wait(1100);
				setBeam(false);
				turnLightOff();
				await wait(400);
				await bearExit("walk", 20);
			}
		},
		{
			name: "extremely angry",
			run: async () => {
				spawnBear("furious");
				setPhase("BEAR_ENTERING");
				sfx.grunt(110);
				await moveTo(72, "stomp", 42);
				setPhase("BEAR_ACTION");
				setExpr("roar");
				setAction("roar");
				sfx.roar();
				await wait(1e3);
				setAction("none");
				setExpr("furious");
				sfx.grunt(100);
				setReaching(true);
				await wait(250);
				sfx.switchClick();
				sfx.slam();
				setShake(true);
				setTimeout(() => setShake(false), 500);
				setLightOn(false);
				setBearDark(true);
				setPhase("LIGHT_OFF");
				updateStatistics("defeats");
				setReaching(false);
				setFacing(-1);
				setAction("shiver");
				sfx.growl(1.2);
				await wait(1800);
				setAction("none");
				setFacing(1);
				await bearExit("stomp", 55);
			}
		}
	];
	const selectRandomBearBehavior = () => behaviors[Math.floor(Math.random() * behaviors.length)];
	const executeBearBehavior = async () => {
		await (selectRandomBearBehavior() ?? behaviors[0]).run();
	};
	const activateLight = (0, import_react.useCallback)(async () => {
		if (phase !== "IDLE") return;
		setEverPulled(true);
		unlockAudio();
		setPhase("PULLING_ROPE");
		sfx.ropePull();
		sfx.switchClick();
		setRopeDrag(0);
		setSwing(true);
		setTimeout(() => setSwing(false), 2400);
		await flickerLight();
		updateStatistics("lights");
		await wait(2e3 + Math.random() * 1e3);
		await openDoor();
		await executeBearBehavior();
		await slamDoor();
		resetRoom();
	}, [phase]);
	(0, import_react.useEffect)(() => {
		const total = stats.lights;
		const hit = [...TAUNTS].reverse().find((t) => total >= t.at);
		setTaunt(hit ? hit.text : "");
	}, [stats.lights]);
	const onRopeDown = (e) => {
		if (phase !== "IDLE") return;
		e.preventDefault();
		unlockAudio();
		dragging.current = true;
		startY.current = e.clientY;
		e.target.setPointerCapture?.(e.pointerId);
	};
	const onRopeMove = (e) => {
		if (!dragging.current) return;
		const dy = Math.max(0, Math.min(140, e.clientY - startY.current));
		setRopeDrag(dy);
		if (dy > PULL_THRESHOLD) {
			dragging.current = false;
			setRopeDrag(0);
			activateLight();
		}
	};
	const onRopeUp = () => {
		if (!dragging.current) return;
		dragging.current = false;
		if (ropeDrag <= PULL_THRESHOLD) {
			setRopeDrag(0);
			setSwing(true);
			setTimeout(() => setSwing(false), 2400);
			activateLight();
		}
	};
	const toggleMute = () => {
		const next = !muted;
		setMutedState(next);
		setMuted(next);
		if (!next) unlockAudio();
	};
	const darkness = lightOn ? .06 : phase === "IDLE" || !everPulled ? .88 : .9;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: `stage ${shake ? "stage--shake" : ""}`,
		onPointerUp: onRopeUp,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wall" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "baseboard" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "floor" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "doorframe",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "doorway-dark" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "doorway-slot",
						children: [eyes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "doorway-eyes",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})]
						}), peek !== "none" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `peek ${peek === "out" ? "peek--out" : ""}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bear, {
								expression: "suspicious",
								gait: "idle",
								facing: 1,
								silhouette: true,
								glowEyes: true,
								action: "look"
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `door door--${doorState}` })
				]
			}),
			bearVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "bear-shadow",
				style: {
					left: `${bearX}%`,
					translate: "-50% 0",
					transitionProperty: "left",
					transitionDuration: `${bearDur}ms`,
					transitionTimingFunction: "linear",
					opacity: lightOn ? .5 : 0
				}
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					position: "absolute",
					bottom: 0,
					left: `${bearX}%`,
					translate: "-50% 0",
					width: 0,
					height: "100%",
					zIndex: 5,
					transitionProperty: "left",
					transitionDuration: `${bearDur}ms`,
					transitionTimingFunction: "linear"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bear, {
					expression: expr,
					gait,
					facing,
					reaching,
					action,
					glowEyes: bearDark || !lightOn,
					silhouette: bearDark || !lightOn
				})
			})] }),
			beam && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "beam",
				style: {
					left: `${bearX + 4}%`,
					width: `${ROPE_X - bearX - 4}%`,
					bottom: "46%"
				}
			}),
			projectile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "projectile",
				style: {
					left: `${projectile.x}%`,
					top: projectile.fly ? "calc(9vh + 5vw)" : "58%",
					transition: "left 0.42s linear, top 0.42s ease-out"
				}
			}),
			puff && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "puff",
				style: {
					left: `${bearX + 3}%`,
					width: `${Math.max(4, ROPE_X - bearX - 3)}%`,
					bottom: "44%"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lamp",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "lamp-wire" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "lamp-shade" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `bulb ${lightOn ? "bulb--on" : ""}` })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `rope ${swing ? "rope--swing" : ""}`,
				style: {
					top: "calc(9vh + 6vw - 25px)",
					left: `${ROPE_X}%`
				},
				onPointerDown: onRopeDown,
				onPointerMove: onRopeMove,
				role: "button",
				tabIndex: 0,
				"aria-label": "Pull the light rope",
				onKeyDown: (e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						activateLight();
					}
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rope-line",
					style: {
						height: `calc(24vh + ${ropeDrag}px)`,
						transition: dragging.current ? "none" : "height 0.35s cubic-bezier(.34,1.56,.64,1)"
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rope-knob" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lightcone",
				style: { opacity: lightOn ? 1 : 0 }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "darkness",
				style: { opacity: darkness }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "vignette" }),
			taunt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hud hud--taunt",
				children: taunt
			}),
			!everPulled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hint",
				children: "Pull the rope"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "mute-btn hud",
				onClick: toggleMute,
				"aria-label": "Toggle sound",
				children: muted ? "SOUND OFF" : "SOUND ON"
			})
		]
	});
}
//#endregion
export { UselessProject as component };
