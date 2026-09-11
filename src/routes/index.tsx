import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bear, type BearAction, type BearExpression, type BearGait } from "@/components/Bear";
import { sfx, setMuted, unlockAudio } from "@/lib/sfx";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Interactive Room" },
      {
        name: "description",
        content:
          "Pull the rope, light the room, and watch a very annoyed cartoon bear storm in and switch it straight back off. Forever.",
      },
      { property: "og:title", content: "Interactive Room" },
      {
        property: "og:description",
        content:
          "An intentionally useless interactive room: pull the light cord, meet an angry cute bear, repeat forever.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UselessProject,
});

/* ---------------- constants ---------------- */

const ROPE_X = 78; // % of viewport width
const DOOR_X = 50;
const OFFSTAGE_X = 50; // bear spawns inside the doorway
const PULL_THRESHOLD = 55;

type Phase =
  | "IDLE"
  | "PULLING_ROPE"
  | "LIGHT_FLICKERING"
  | "LIGHT_ON"
  | "DOOR_OPENING"
  | "BEAR_ENTERING"
  | "BEAR_ACTION"
  | "LIGHT_OFF"
  | "BEAR_EXITING"
  | "DOOR_SLAM";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const TAUNTS: { at: number; text: string }[] = [
  { at: 3, text: "He heard that." },
  { at: 5, text: "He is starting to get annoyed." },
  { at: 8, text: "He was having a nice nap, you know." },
  { at: 10, text: "Bro. Stop turning it on." },
  { at: 15, text: "The bear has begun taking notes." },
  { at: 20, text: "You have learned absolutely nothing." },
  { at: 30, text: "Neither of you will win this." },
  { at: 50, text: "This is your life now." },
  { at: 75, text: "He respects your commitment. Slightly." },
  { at: 100, text: "One hundred. The bear has moved in permanently." },
];

/* ---------------- component ---------------- */

function UselessProject() {
  const [phase, setPhase] = useState<Phase>("IDLE");
  const [lightOn, setLightOn] = useState(false);
  const [doorState, setDoorState] = useState<"closed" | "ajar" | "opening" | "open">("closed");
  const [eyes, setEyes] = useState(false);
  const [peek, setPeek] = useState<"none" | "in" | "out">("none");
  const [shake, setShake] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [everPulled, setEverPulled] = useState(false);
  const [ropeDrag, setRopeDrag] = useState(0);
  const [swing, setSwing] = useState(false);

  // bear state
  const [bearVisible, setBearVisible] = useState(false);
  const [bearX, setBearX] = useState(OFFSTAGE_X);
  const [bearDur, setBearDur] = useState(0);
  const [gait, setGait] = useState<BearGait>("idle");
  const [expr, setExpr] = useState<BearExpression>("angry");
  const [facing, setFacing] = useState<1 | -1>(1);
  const [reaching, setReaching] = useState(false);
  const [beam, setBeam] = useState(false);
  const [bearDark, setBearDark] = useState(false);
  const [action, setAction] = useState<BearAction>("none");
  const [projectile, setProjectile] = useState<{ x: number; fly: boolean } | null>(null);
  const [puff, setPuff] = useState(false);

  const [stats, setStats] = useState({ lights: 0, appearances: 0, defeats: 0, slams: 0 });
  const [taunt, setTaunt] = useState("");


  const dragging = useRef(false);
  const startY = useRef(0);
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => void (stepTimer.current && clearInterval(stepTimer.current)), []);

  const updateStatistics = useCallback((key: keyof typeof stats) => {
    setStats((s) => ({ ...s, [key]: s[key] + 1 }));
  }, []);

  /* ---------- helpers ---------- */

  const footsteps = (interval: number, heavy = false) => {
    if (stepTimer.current) clearInterval(stepTimer.current);
    stepTimer.current = setInterval(() => sfx.step(heavy), interval);
  };
  const stopFootsteps = () => {
    if (stepTimer.current) clearInterval(stepTimer.current);
    stepTimer.current = null;
  };

  const moveTo = async (target: number, g: BearGait, speed: number) => {
    const distance = Math.abs(target - bearXRef.current);
    const ms = Math.max(220, (distance / speed) * 1000);
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

  const bearXRef = useRef(OFFSTAGE_X);

  /* ---------- sequence steps ---------- */

  const flickerLight = async () => {
    setPhase("LIGHT_FLICKERING");
    const flickers = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < flickers; i++) {
      setLightOn(true);
      sfx.flick();
      sfx.buzz(0.12);
      await wait(40 + Math.random() * 110);
      setLightOn(false);
      await wait(50 + Math.random() * 160);
    }
    setLightOn(true);
    sfx.buzz(0.5);
    setPhase("LIGHT_ON");
  };

  const openDoor = async () => {
    setPhase("DOOR_OPENING");

    // 1. the door creeps open a crack
    sfx.creak();
    setDoorState("ajar");
    await wait(1500);

    // 2. two glowing eyes in the dark gap
    setEyes(true);
    sfx.growl(1.4);
    await wait(1500);
    sfx.sting();
    await wait(700);
    setEyes(false);

    // 3. a head slowly leans out of the darkness and looks around
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

    // 4. and then the door swings fully open
    sfx.creak();
    setDoorState("opening");
    await wait(1800);
    setDoorState("open");
    await wait(600);
  };

  const spawnBear = (expression: BearExpression) => {
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

  const bearExit = async (g: BearGait = "walk", speed = 30) => {
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

  /* ---------- bear behaviors ---------- */

  /* different ways the bear kills the light */

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
    setProjectile({ x: bearXRef.current + 3, fly: false });
    await wait(30);
    sfx.whoosh();
    setProjectile({ x: ROPE_X, fly: true });
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

  const flipMethods = [flipReach, flipJump, flipThrow, flipBlow, flipTug, flipSwipe];

  const reachAndFlip = async (holdBefore = 250) => {
    await wait(holdBefore);
    const method = flipMethods[Math.floor(Math.random() * flipMethods.length)] ?? flipReach;
    await method();
  };

  const behaviors: { name: string; run: () => Promise<void> }[] = [
    {
      name: "normal",
      run: async () => {
        spawnBear("angry");
        setPhase("BEAR_ENTERING");
        setAction("look");
        await wait(1100);
        setAction("none");
        await moveTo(ROPE_X - 12, "walk", 34);
        setPhase("BEAR_ACTION");
        setAction("shake");
        sfx.grunt(200);
        await wait(900);
        setAction("none");
        await moveTo(ROPE_X - 6, "walk", 30);
        await reachAndFlip();
        await bearExit("walk", 34);
      },
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
        await moveTo(ROPE_X - 6, "run", 90);
        setPhase("BEAR_ACTION");
        await reachAndFlip(80);
        sfx.grunt(120);
        await bearExit("run", 95);
      },
    },
    {
      name: "sleepy",
      run: async () => {
        spawnBear("sleepy");
        setPhase("BEAR_ENTERING");
        sfx.yawn();
        await moveTo(ROPE_X - 6, "walk", 16);
        setPhase("BEAR_ACTION");
        sfx.yawn();
        setAction("look");
        await wait(1800);
        setAction("none");
        await reachAndFlip(500);
        await bearExit("walk", 14);
      },
    },
    {
      name: "ninja",
      run: async () => {
        spawnBear("sneaky");
        setPhase("BEAR_ENTERING");
        await wait(700);
        await moveTo(DOOR_X + 8, "sneak", 18);
        setAction("sniff");
        sfx.sniff();
        await wait(1000);
        setAction("none");
        setFacing(-1);
        await wait(600);
        setFacing(1);
        await wait(600);
        await moveTo(ROPE_X - 6, "tiptoe", 20);
        setPhase("BEAR_ACTION");
        await reachAndFlip(300);
        await bearExit("sneak", 22);
      },
    },
    {
      name: "suspicious",
      run: async () => {
        spawnBear("suspicious");
        setPhase("BEAR_ENTERING");
        await moveTo(ROPE_X - 10, "walk", 30);
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
        await moveTo(ROPE_X - 6, "walk", 24);
        await reachAndFlip(300);
        await bearExit("walk", 30);
      },
    },
    {
      name: "dancing",
      run: async () => {
        spawnBear("silly");
        setPhase("BEAR_ENTERING");
        await moveTo(DOOR_X + 12, "walk", 34);
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
        await moveTo(ROPE_X - 6, "hop", 42);
        await reachAndFlip(150);
        await bearExit("walk", 36);
      },
    },
    {
      name: "lazy",
      run: async () => {
        spawnBear("sleepy");
        setPhase("BEAR_ENTERING");
        await moveTo(DOOR_X + 6, "roll", 40);
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
      },
    },
    {
      name: "extremely angry",
      run: async () => {
        spawnBear("furious");
        setPhase("BEAR_ENTERING");
        sfx.grunt(110);
        await moveTo(ROPE_X - 6, "stomp", 42);
        setPhase("BEAR_ACTION");
        setExpr("roar");
        setAction("roar");
        sfx.roar();
        await wait(1000);
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
      },
    },
  ];

  const selectRandomBearBehavior = () => behaviors[Math.floor(Math.random() * behaviors.length)];

  const executeBearBehavior = async () => {
    const behavior = selectRandomBearBehavior() ?? behaviors[0]!;
    await behavior.run();
  };

  /* ---------- main loop ---------- */

  const activateLight = useCallback(async () => {
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

    await wait(2000 + Math.random() * 1000);
    await openDoor();
    await executeBearBehavior();
    await slamDoor();
    resetRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    const total = stats.lights;
    const hit = [...TAUNTS].reverse().find((t) => total >= t.at);
    setTaunt(hit ? hit.text : "");
  }, [stats.lights]);

  /* ---------- rope input ---------- */

  const onRopeDown = (e: React.PointerEvent) => {
    if (phase !== "IDLE") return;
    e.preventDefault();
    unlockAudio();
    dragging.current = true;
    startY.current = e.clientY;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onRopeMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dy = Math.max(0, Math.min(140, e.clientY - startY.current));
    setRopeDrag(dy);
    if (dy > PULL_THRESHOLD) {
      dragging.current = false;
      setRopeDrag(0);
      void activateLight();
    }
  };

  const onRopeUp = () => {
    if (!dragging.current) {
      return;
    }
    dragging.current = false;
    if (ropeDrag <= PULL_THRESHOLD) {
      // treat as a tap
      setRopeDrag(0);
      setSwing(true);
      setTimeout(() => setSwing(false), 2400);
      void activateLight();
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
    if (!next) unlockAudio();
  };

  const darkness = lightOn ? 0.06 : phase === "IDLE" || !everPulled ? 0.88 : 0.9;

  return (
    <main className={`stage ${shake ? "stage--shake" : ""}`} onPointerUp={onRopeUp}>

      <div className="wall" />
      <div className="baseboard" />
      <div className="floor" />

      <div className="doorframe">
        <div className="doorway-dark" />
        <div className="doorway-slot">
          {eyes && (
            <div className="doorway-eyes">
              <span />
              <span />
            </div>
          )}
          {peek !== "none" && (
            <div className={`peek ${peek === "out" ? "peek--out" : ""}`}>
              <Bear
                expression="suspicious"
                gait="idle"
                facing={1}
                silhouette
                glowEyes
                action="look"
              />
            </div>
          )}
        </div>
        <div className={`door door--${doorState}`} />
      </div>

      {/* bear */}
      {bearVisible && (
        <>
          <div
            className="bear-shadow"
            style={{
              left: `${bearX}%`,
              translate: "-50% 0",
              transitionProperty: "left",
              transitionDuration: `${bearDur}ms`,
              transitionTimingFunction: "linear",
              opacity: lightOn ? 0.5 : 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: `${bearX}%`,
              translate: "-50% 0",
              width: 0,
              height: "100%",
              zIndex: 5,
              transitionProperty: "left",
              transitionDuration: `${bearDur}ms`,
              transitionTimingFunction: "linear",
            }}
          >
            <Bear
              expression={expr}
              gait={gait}
              facing={facing}
              reaching={reaching}
              action={action}
              glowEyes={bearDark || !lightOn}
              silhouette={bearDark || !lightOn}
            />
          </div>
        </>
      )}

      {beam && (
        <div
          className="beam"
          style={{
            left: `${bearX + 4}%`,
            width: `${ROPE_X - bearX - 4}%`,
            bottom: "46%",
          }}
        />
      )}

      {projectile && (
        <div
          className="projectile"
          style={{
            left: `${projectile.x}%`,
            top: projectile.fly ? "calc(9vh + 5vw)" : "58%",
            transition: "left 0.42s linear, top 0.42s ease-out",
          }}
        />
      )}

      {puff && (
        <div
          className="puff"
          style={{
            left: `${bearX + 3}%`,
            width: `${Math.max(4, ROPE_X - bearX - 3)}%`,
            bottom: "44%",
          }}
        />
      )}

      {/* lamp */}
      <div className="lamp">
        <div className="lamp-wire" />
        <div className="lamp-shade" />
        <div className={`bulb ${lightOn ? "bulb--on" : ""}`} />
      </div>

      {/* rope */}
      <div
        className={`rope ${swing ? "rope--swing" : ""}`}
        style={{ top: "calc(9vh + 6vw - 25px)", left: `${ROPE_X}%` }}
        onPointerDown={onRopeDown}
        onPointerMove={onRopeMove}
        role="button"
        tabIndex={0}
        aria-label="Pull the light rope"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            void activateLight();
          }
        }}
      >
        <div
          className="rope-line"
          style={{
            height: `calc(24vh + ${ropeDrag}px)`,
            transition: dragging.current ? "none" : "height 0.35s cubic-bezier(.34,1.56,.64,1)",
          }}
        />
        <div className="rope-knob" />
      </div>

      <div className="lightcone" style={{ opacity: lightOn ? 1 : 0 }} />
      <div className="darkness" style={{ opacity: darkness }} />
      <div className="vignette" />

      {taunt && <div className="hud hud--taunt">{taunt}</div>}

      {!everPulled && <div className="hint">Pull the rope</div>}

      <button className="mute-btn hud" onClick={toggleMute} aria-label="Toggle sound">
        {muted ? "SOUND OFF" : "SOUND ON"}
      </button>
    </main>
  );
}
