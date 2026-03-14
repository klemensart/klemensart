"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import * as THREE from "three";
import { ARTWORKS } from "./data";
import type { Artwork, RoomConfig } from "./types";
import { createScene } from "./scene-setup";
import { buildAllRooms, getWalkableRects } from "./room-layout";
// import { loadGLBModel, cloneGLBForRoom } from "./glb-loader";
import {
  placeAllArtworks,
  checkLazyLoad,
  preloadRoom,
  type ArtMeshInfo,
} from "./artwork-placer";
import {
  createNavState,
  updateNavigation,
  setupKeyboardEvents,
  setupMouseEvents,
  setupTouchEvents,
} from "./navigation";
import { getActiveRoom } from "./room-tracker";
import { ROOMS, DOORS, ROOM_SIZE, getRoomCenter } from "./data";

export default function Gallery() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Teleport fade
  const [teleportFade, setTeleportFade] = useState(false);

  // Artwork interaction
  const [selectedArtIndex, setSelectedArtIndex] = useState<number | null>(null);
  const [nearestArt, setNearestArt] = useState<Artwork | null>(null);
  const nearestArtIdxRef = useRef<number | null>(null);

  // Room tracking
  const [activeRoom, setActiveRoom] = useState<RoomConfig | null>(null);
  const [roomLabel, setRoomLabel] = useState<string | null>(null);
  const roomLabelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevRoomIdRef = useRef<number | null>(null);

  // Door teleport
  const [nearDoor, setNearDoor] = useState<{
    destRoom: RoomConfig;
    destCenter: [number, number, number];
  } | null>(null);
  const nearDoorRef = useRef<typeof nearDoor>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Slideshow
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const touchStartXRef = useRef(0);


  // Refs for animation loop
  const overlayOpenRef = useRef(false);
  const frameIdRef = useRef<number | null>(null);
  const navRef = useRef<ReturnType<typeof createNavState> | null>(null);

  // Sync overlay ref
  useEffect(() => {
    overlayOpenRef.current = selectedArtIndex !== null || showSlideshow;
  }, [selectedArtIndex, showSlideshow]);

  // ── Main scene initialization ──
  useEffect(() => {
    if (!mountRef.current) return;

    setLoadProgress(10);
    const ctx = createScene(mountRef.current);
    cameraRef.current = ctx.camera;
    setIsMobile(ctx.isMobile);

    setLoadProgress(30);
    // Build procedural rooms
    buildAllRooms(ctx);

    setLoadProgress(50);
    // Place artworks
    const artMeshInfos = placeAllArtworks(ctx.scene, ctx.renderer);
    const artMeshes = artMeshInfos.map((a) => a.mesh);

    setLoadProgress(70);
    // Preload starting room textures immediately
    preloadRoom(artMeshInfos, 0);

    setLoadProgress(90);
    // Navigation
    const nav = createNavState();
    navRef.current = nav;
    const walkRects = getWalkableRects();

    // Event listeners
    const cleanupKeyboard = setupKeyboardEvents(nav, overlayOpenRef);
    const cleanupMouse = setupMouseEvents(nav, ctx.renderer.domElement);
    const cleanupTouch = setupTouchEvents(
      nav,
      ctx.camera,
      ctx.renderer.domElement
    );

    // Animation loop
    let lazyFrame = 0;

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      // Lazy load artwork textures
      checkLazyLoad(artMeshInfos, ctx.camera, lazyFrame);
      lazyFrame++;

      // Navigation
      const { nearestArtIdx } = updateNavigation(
        nav,
        ctx.camera,
        walkRects,
        artMeshes,
        overlayOpenRef.current
      );

      // Update nearest art
      if (nearestArtIdx !== nearestArtIdxRef.current) {
        nearestArtIdxRef.current = nearestArtIdx;
        setNearestArt(
          nearestArtIdx !== null ? artMeshInfos[nearestArtIdx].artwork : null
        );
      }

      // Room tracking
      const room = getActiveRoom(ctx.camera.position);
      if (room && room.id !== prevRoomIdRef.current) {
        prevRoomIdRef.current = room.id;
        setActiveRoom(room);
        setRoomLabel(room.name);
        if (roomLabelTimerRef.current) {
          clearTimeout(roomLabelTimerRef.current);
        }
        roomLabelTimerRef.current = setTimeout(() => {
          setRoomLabel(null);
        }, 3000);
      }

      // Door proximity detection (for teleport)
      // Only show when very close AND facing the door
      let foundDoor: typeof nearDoor = null;
      let bestDoorDist = 2.0; // tighter detection radius

      // Camera forward direction (from yaw)
      const camFwdX = -Math.sin(nav.yaw);
      const camFwdZ = -Math.cos(nav.yaw);

      for (const door of DOORS) {
        const rA = ROOMS[door.roomA];
        const rB = ROOMS[door.roomB];
        const [ax, , az] = getRoomCenter(rA);
        const [bx, , bz] = getRoomCenter(rB);
        const mx = (ax + bx) / 2;
        const mz = (az + bz) / 2;

        const dx = ctx.camera.position.x - mx;
        const dz = ctx.camera.position.z - mz;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < bestDoorDist && room) {
          // Check if camera is facing toward the door
          const toDoorX = mx - ctx.camera.position.x;
          const toDoorZ = mz - ctx.camera.position.z;
          const len = Math.sqrt(toDoorX * toDoorX + toDoorZ * toDoorZ);
          const dot = (camFwdX * toDoorX + camFwdZ * toDoorZ) / (len || 1);
          // dot > 0.3 ≈ looking roughly toward the door (±72°)
          if (dot < 0.3) continue;

          bestDoorDist = dist;
          const destRoom =
            room.id === door.roomA ? rB : rA;
          foundDoor = {
            destRoom,
            destCenter: getRoomCenter(destRoom),
          };
        }
      }

      if (
        foundDoor?.destRoom.id !== nearDoorRef.current?.destRoom.id
      ) {
        nearDoorRef.current = foundDoor;
        setNearDoor(foundDoor);
      }

      ctx.renderer.render(ctx.scene, ctx.camera);
    };
    animate();

    setLoadProgress(100);
    setIsLoading(false);

    // Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      ctx.camera.aspect = w / h;
      ctx.camera.updateProjectionMatrix();
      ctx.renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cleanupKeyboard();
      cleanupMouse();
      cleanupTouch();
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      if (roomLabelTimerRef.current) clearTimeout(roomLabelTimerRef.current);
      if (mountRef.current && ctx.renderer.domElement) {
        mountRef.current.removeChild(ctx.renderer.domElement);
      }
      ctx.renderer.dispose();
    };
  }, []);

  // Keyboard navigation for overlays
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedArtIndex !== null) {
        if (e.key === "Escape") {
          setSelectedArtIndex(null);
          return;
        }
        if (e.key === "ArrowLeft") {
          setSelectedArtIndex(
            (i) => (i !== null ? (i - 1 + ARTWORKS.length) % ARTWORKS.length : i)
          );
          return;
        }
        if (e.key === "ArrowRight") {
          setSelectedArtIndex(
            (i) => (i !== null ? (i + 1) % ARTWORKS.length : i)
          );
          return;
        }
      }
      if (showSlideshow) {
        if (e.key === "Escape") {
          setShowSlideshow(false);
          return;
        }
        if (e.key === "ArrowLeft") {
          setSlideshowIndex(
            (i) => (i - 1 + ARTWORKS.length) % ARTWORKS.length
          );
          return;
        }
        if (e.key === "ArrowRight") {
          setSlideshowIndex((i) => (i + 1) % ARTWORKS.length);
          return;
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedArtIndex, showSlideshow]);

  const handleTeleport = useCallback(() => {
    const door = nearDoorRef.current;
    const camera = cameraRef.current;
    const nav = navRef.current;
    if (!door || !camera || !nav) return;

    // Fade out
    setTeleportFade(true);
    const dest = door.destCenter;
    nearDoorRef.current = null;
    setNearDoor(null);

    setTimeout(() => {
      camera.position.set(dest[0], 1.7, dest[2]);
      nav.velocity.set(0, 0, 0);
      nav.keys = {};

      // Fade in
      setTimeout(() => setTeleportFade(false), 100);
    }, 400);
  }, []);

  const navBtn = (key: string) => ({
    onMouseDown: () => {
      if (navRef.current && !overlayOpenRef.current) navRef.current.keys[key] = true;
    },
    onMouseUp: () => {
      if (navRef.current) navRef.current.keys[key] = false;
    },
    onMouseLeave: () => {
      if (navRef.current) navRef.current.keys[key] = false;
    },
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      if (navRef.current && !overlayOpenRef.current) navRef.current.keys[key] = true;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      if (navRef.current) navRef.current.keys[key] = false;
    },
    onTouchCancel: () => {
      if (navRef.current) navRef.current.keys[key] = false;
    },
  });

  const selectedArt = ARTWORKS[selectedArtIndex ?? 0];
  const viewerVisible = selectedArtIndex !== null;

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#1a1714",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 3D Canvas */}
      <div
        ref={mountRef}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          touchAction: "none",
        }}
      />

      {/* Teleport fade */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#000",
          pointerEvents: "none",
          zIndex: 45,
          opacity: teleportFade ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 5,
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Loading */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a0a",
            zIndex: 50,
          }}
        >
          <div style={{ textAlign: "center", width: 280 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 6,
                color: "#FF6D60",
                marginBottom: 16,
              }}
            >
              KLEMENS SANAL SERG&#304;
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 300,
                fontStyle: "italic",
                color: "#fff",
                marginBottom: 24,
                letterSpacing: 2,
              }}
            >
              En Sessiz Zaman
            </div>
            <div
              style={{
                width: "100%",
                height: 3,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 2,
                overflow: "hidden",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: `${loadProgress}%`,
                  height: "100%",
                  background: "#FF6D60",
                  borderRadius: 2,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div style={{ fontSize: 12, color: "#555" }}>
              Galeri haz&#305;rlan&#305;yor... %{loadProgress}
            </div>
          </div>
        </div>
      )}

      {/* Back link */}
      <Link
        href="/"
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          color: "rgba(255,255,255,0.5)",
          fontSize: 13,
          fontWeight: 500,
          textDecoration: "none",
          zIndex: 20,
          transition: "color 0.2s",
        }}
        onMouseOver={(e) => {
          (e.target as HTMLElement).style.color = "#FF6D60";
        }}
        onMouseOut={(e) => {
          (e.target as HTMLElement).style.color = "rgba(255,255,255,0.5)";
        }}
      >
        &larr; Klemens&apos;e D&ouml;n
      </Link>

      {/* Gallery title overlay */}
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 20,
          color: "#fff",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: 4,
            color: "#FF6D60",
            marginBottom: 4,
          }}
        >
          KLEMENS SANAL SERG&#304;
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 300,
            letterSpacing: 4,
            fontStyle: "italic",
          }}
        >
          En Sessiz Zaman
        </div>
        <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
          Theo Atay &mdash; 6 Oda, 21 Eser
        </div>
      </div>

      {/* Minimap */}
      {!showIntro && !viewerVisible && !showSlideshow && (
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 20,
            background: "rgba(0,0,0,0.6)",
            borderRadius: 8,
            padding: 8,
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "36px 36px",
              gridTemplateRows: "36px 36px 36px",
              gap: 3,
            }}
          >
            {ROOMS.map((r) => (
              <div
                key={r.id}
                style={{
                  background:
                    activeRoom?.id === r.id
                      ? "rgba(255,109,96,0.4)"
                      : "rgba(255,255,255,0.06)",
                  borderRadius: 4,
                  border:
                    activeRoom?.id === r.id
                      ? "1px solid #FF6D60"
                      : "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 7,
                  color:
                    activeRoom?.id === r.id
                      ? "#fff"
                      : "rgba(255,255,255,0.3)",
                  fontWeight: activeRoom?.id === r.id ? 700 : 400,
                  lineHeight: 1.1,
                  textAlign: "center",
                  padding: 2,
                }}
              >
                {r.name.split(" / ")[0].slice(0, 6)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Room label overlay */}
      {roomLabel && !showIntro && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 15,
            pointerEvents: "none",
            textAlign: "center",
            animation: "fadeInOut 3s ease forwards",
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 300,
              color: "#fff",
              letterSpacing: 6,
              textShadow: "0 2px 20px rgba(0,0,0,0.8)",
            }}
          >
            {roomLabel}
          </div>
          {activeRoom && (
            <div
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.5)",
                marginTop: 8,
                letterSpacing: 2,
              }}
            >
              {activeRoom.subtitle}
            </div>
          )}
        </div>
      )}

      {/* On-screen nav controls */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          userSelect: "none",
        }}
      >
        {/* Rotation buttons */}
        <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          <NavButton {...navBtn("q")}>&#8634;</NavButton>
          <NavButton {...navBtn("e")}>&#8635;</NavButton>
        </div>
        {/* D-pad */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "42px 42px 42px",
            gridTemplateRows: "42px 42px 42px",
            gap: 4,
          }}
        >
          <div />
          <NavButton {...navBtn("w")}>&#9650;</NavButton>
          <div />
          <NavButton {...navBtn("a")}>&#9664;</NavButton>
          <NavButton {...navBtn("s")}>&#9660;</NavButton>
          <NavButton {...navBtn("d")}>&#9654;</NavButton>
        </div>
      </div>

      {/* Slideshow button (always visible, bottom-left) */}
      {!showIntro && !viewerVisible && !showSlideshow && (
        <button
          onClick={() => {
            setSlideshowIndex(0);
            setShowSlideshow(true);
          }}
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            zIndex: 30,
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 24,
            padding: "10px 20px",
            color: "#aaa",
            fontSize: 13,
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            transition: "color 0.2s, background 0.2s",
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLElement).style.color = "#fff";
            (e.currentTarget as HTMLElement).style.background =
              "rgba(255,255,255,0.12)";
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLElement).style.color = "#aaa";
            (e.currentTarget as HTMLElement).style.background =
              "rgba(0,0,0,0.5)";
          }}
        >
          Panoramik G&ouml;r&uuml;n&uuml;m
        </button>
      )}

      {/* Intro overlay */}
      {showIntro && !isLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#0a0a0a",
            display: "flex",
            justifyContent: "center",
            zIndex: 40,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: 560,
              padding: "48px 32px",
              margin: "auto 0",
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: 6,
                color: "#FF6D60",
                marginBottom: 24,
              }}
            >
              KLEMENS SANAL SERG&#304;
            </div>

            <div
              style={{
                fontSize: 28,
                fontWeight: 300,
                fontStyle: "italic",
                color: "#fff",
                marginBottom: 20,
                letterSpacing: 2,
                lineHeight: 1.3,
              }}
            >
              &ldquo;En Sessiz Zaman&rdquo;
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: 15,
                lineHeight: 1.9,
                margin: "0 0 32px 0",
                fontStyle: "italic",
              }}
            >
              Binlerce y&#305;l &ouml;ncesinin sesleri aniden kayboluyor,
              ku&#351;lar&#305;n, a&#287;a&ccedil;lar&#305;n, do&#287;an&#305;n
              ve benim sesimle kar&#305;&#351;&#305;yor. Ve bu sessizlik
              anlar&#305;nda, aram&#305;zda hi&ccedil;bir fark
              olmad&#305;&#287;&#305;n&#305;, bir ve ayn&#305;
              oldu&#287;umuzu hissediyorum.
            </p>

            <div
              style={{
                width: 40,
                height: 1,
                background: "rgba(255,255,255,0.15)",
                margin: "0 auto 32px",
              }}
            />

            <div
              style={{
                fontSize: 22,
                fontWeight: 300,
                fontStyle: "italic",
                color: "rgba(255,255,255,0.5)",
                marginBottom: 16,
                letterSpacing: 1,
                lineHeight: 1.3,
              }}
            >
              &ldquo;The Quietest Time&rdquo;
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: 14,
                lineHeight: 1.9,
                margin: "0 0 32px 0",
                fontStyle: "italic",
              }}
            >
              The sounds of thousands of years ago suddenly disappear, mingling
              with the sounds of birds, trees, nature and me. And in such
              moments of silence, I feel that there is no difference between us,
              that we are one and the same.
            </p>

            <div
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 14,
                letterSpacing: 3,
                marginBottom: 32,
                fontWeight: 500,
              }}
            >
              &mdash; Theo Atay
            </div>

            {/* Room map preview */}
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 24,
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: 3,
                  color: "#FF6D60",
                  marginBottom: 12,
                }}
              >
                6 ODA &mdash; 21 ESER &mdash; 9 ANT&#304;K &#350;EH&#304;R
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 6,
                  maxWidth: 300,
                  margin: "0 auto",
                }}
              >
                {ROOMS.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: 6,
                      padding: "8px 10px",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.7)",
                        marginBottom: 2,
                      }}
                    >
                      {r.name}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                      {r.subtitle}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 32,
                textAlign: "left",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <ControlHint label="WASD / ok tuslari" desc="Hareket" />
                <ControlHint label="Q / E" desc="Sola / saga bak" />
                <ControlHint label="Mouse surukle" desc="Etrafina bak" />
                <ControlHint
                  label="Mobil"
                  desc="Ekrandaki butonlar + dokun-surukle"
                />
              </div>
            </div>

            <button
              onClick={() => setShowIntro(false)}
              style={{
                padding: "14px 48px",
                background: "transparent",
                border: "1px solid rgba(255,109,96,0.5)",
                borderRadius: 10,
                color: "#FF6D60",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                letterSpacing: 2,
              }}
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.background =
                  "rgba(255,109,96,0.12)";
                (e.target as HTMLElement).style.borderColor = "#FF6D60";
              }}
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.background = "transparent";
                (e.target as HTMLElement).style.borderColor =
                  "rgba(255,109,96,0.5)";
              }}
            >
              Sergiyi Ke&#351;fet
            </button>
          </div>
        </div>
      )}

      {/* Proximity prompt */}
      <div
        style={{
          position: "absolute",
          bottom: 90,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pointerEvents: "none",
          zIndex: 25,
          opacity: nearestArt ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      >
        {nearestArt && (
          <>
            <div
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: 2,
                textShadow: "0 2px 8px rgba(0,0,0,0.7)",
                marginBottom: 12,
              }}
            >
              {nearestArt.title}
            </div>
            <button
              onClick={() => {
                if (nearestArtIdxRef.current !== null) {
                  // Find the ARTWORKS index from the art mesh info
                  setSelectedArtIndex(nearestArtIdxRef.current);
                }
              }}
              style={{
                pointerEvents: "auto",
                background: "#FF6D60",
                color: "#fff",
                border: "none",
                borderRadius: 24,
                padding: "10px 28px",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: 1,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(255,109,96,0.4)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.transform = "scale(1)";
              }}
            >
              Kesfet
            </button>
          </>
        )}
      </div>

      {/* Door teleport prompt */}
      {nearDoor && !showIntro && !viewerVisible && !showSlideshow && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 25,
            textAlign: "center",
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(12px)",
              borderRadius: 16,
              padding: "24px 36px",
              border: "1px solid rgba(255,109,96,0.3)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: 3,
                color: "rgba(255,255,255,0.4)",
                marginBottom: 8,
              }}
            >
              SONRAK&#304; ODA
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 300,
                color: "#fff",
                letterSpacing: 3,
                marginBottom: 6,
              }}
            >
              {nearDoor.destRoom.name}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                marginBottom: 18,
              }}
            >
              {nearDoor.destRoom.subtitle}
            </div>
            <button
              onClick={handleTeleport}
              style={{
                padding: "10px 32px",
                background: "rgba(255,109,96,0.15)",
                border: "1px solid rgba(255,109,96,0.5)",
                borderRadius: 24,
                color: "#FF6D60",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: 2,
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,109,96,0.3)";
                (e.currentTarget as HTMLElement).style.borderColor = "#FF6D60";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,109,96,0.15)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,109,96,0.5)";
              }}
            >
              Ge&ccedil;
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen artwork viewer — always mounted, toggled via CSS */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          zIndex: viewerVisible ? 100 : -1,
          display: viewerVisible ? "flex" : "none",
          flexDirection: "column",
          pointerEvents: viewerVisible ? "auto" : "none",
        }}
      >
          <button
            onClick={() => {
              setSelectedArtIndex(null);
              overlayOpenRef.current = false;
            }}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 110,
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "50%",
              width: 44,
              height: 44,
              color: "#fff",
              fontSize: 24,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            &times;
          </button>

          <div
            style={{
              position: "absolute",
              top: 24,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 110,
              color: "rgba(255,255,255,0.4)",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {selectedArtIndex! + 1} / {ARTWORKS.length}
          </div>

          <div
            style={{
              flex: "0 0 65vh",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#000",
            }}
            onTouchStart={(e) => {
              touchStartXRef.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              const diff =
                e.changedTouches[0].clientX - touchStartXRef.current;
              if (Math.abs(diff) > 50) {
                setSelectedArtIndex((i) =>
                  i !== null
                    ? diff > 0
                      ? (i - 1 + ARTWORKS.length) % ARTWORKS.length
                      : (i + 1) % ARTWORKS.length
                    : i
                );
              }
            }}
          >
            <ArrowButton
              dir="left"
              onClick={() =>
                setSelectedArtIndex((i) =>
                  i !== null
                    ? (i - 1 + ARTWORKS.length) % ARTWORKS.length
                    : i
                )
              }
            />
            <img
              key={selectedArtIndex}
              src={selectedArt.image}
              alt={selectedArt.title}
              style={{
                maxWidth: "calc(100% - 120px)",
                maxHeight: "65vh",
                objectFit: "contain",
              }}
            />
            <ArrowButton
              dir="right"
              onClick={() =>
                setSelectedArtIndex((i) =>
                  i !== null ? (i + 1) % ARTWORKS.length : i
                )
              }
            />
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 24px",
              background: "#111",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 12,
              }}
            >
              <h2
                style={{
                  color: "#fff",
                  fontSize: 22,
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                {selectedArt.title}
              </h2>
              <span
                style={{
                  background: "rgba(255,109,96,0.15)",
                  color: "#FF6D60",
                  fontSize: 12,
                  padding: "4px 12px",
                  borderRadius: 20,
                  whiteSpace: "nowrap",
                  marginLeft: 12,
                  flexShrink: 0,
                }}
              >
                {selectedArt.location}
              </span>
            </div>

            <p
              style={{
                color: "#FF6D60",
                fontSize: 13,
                margin: "0 0 16px 0",
              }}
            >
              {selectedArt.photographer}
            </p>

            <div
              style={{
                borderLeft: "2px solid #FF6D60",
                paddingLeft: 16,
                marginBottom: 20,
              }}
            >
              <p
                style={{
                  color: "#ccc",
                  fontSize: 14,
                  lineHeight: 1.7,
                  margin: 0,
                  fontStyle: "italic",
                }}
              >
                &ldquo;{selectedArt.note}&rdquo;
              </p>
            </div>

            <div
              style={{
                background: "#1a1a1a",
                borderRadius: 10,
                padding: 16,
              }}
            >
              <div
                style={{
                  color: "#FF6D60",
                  fontSize: 11,
                  letterSpacing: 2,
                  marginBottom: 8,
                  fontWeight: 600,
                }}
              >
                MEKAN HAKKINDA
              </div>
              <p
                style={{
                  color: "#999",
                  fontSize: 13,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {selectedArt.info}
              </p>
            </div>
          </div>
      </div>

      {/* Slideshow */}
      {showSlideshow && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#000",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 110,
            }}
          >
            <button
              onClick={() => setShowSlideshow(false)}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: "50%",
                width: 44,
                height: 44,
                color: "#fff",
                fontSize: 24,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              &times;
            </button>
            <span
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {slideshowIndex + 1} / {ARTWORKS.length}
            </span>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
            onTouchStart={(e) => {
              touchStartXRef.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              const diff =
                e.changedTouches[0].clientX - touchStartXRef.current;
              if (Math.abs(diff) > 50) {
                setSlideshowIndex((i) =>
                  diff > 0
                    ? (i - 1 + ARTWORKS.length) % ARTWORKS.length
                    : (i + 1) % ARTWORKS.length
                );
              }
            }}
          >
            <ArrowButton
              dir="left"
              onClick={() =>
                setSlideshowIndex(
                  (i) => (i - 1 + ARTWORKS.length) % ARTWORKS.length
                )
              }
            />
            <img
              key={slideshowIndex}
              src={ARTWORKS[slideshowIndex].image}
              alt={ARTWORKS[slideshowIndex].title}
              style={{
                maxWidth: "calc(100% - 120px)",
                maxHeight: "85vh",
                objectFit: "contain",
              }}
            />
            <ArrowButton
              dir="right"
              onClick={() =>
                setSlideshowIndex((i) => (i + 1) % ARTWORKS.length)
              }
            />
          </div>

          <div
            style={{
              padding: "14px 24px",
              background: "rgba(0,0,0,0.8)",
              textAlign: "center",
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              {ARTWORKS[slideshowIndex].title}
            </div>
            <div
              style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}
            >
              {ARTWORKS[slideshowIndex].location}
            </div>
          </div>
        </div>
      )}

      {/* CSS animation for room label */}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          15% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── Sub-components ──

function NavButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
}) {
  return (
    <button
      {...props}
      style={{
        width: 42,
        height: 42,
        borderRadius: 10,
        background: "rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,255,255,0.15)",
        color: "#fff",
        fontSize: 18,
        cursor: "pointer",
        touchAction: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...((props.style as React.CSSProperties) || {}),
      }}
    >
      {children}
    </button>
  );
}

function ArrowButton({
  dir,
  onClick,
}: {
  dir: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "absolute",
        [dir === "left" ? "left" : "right"]: 12,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 105,
        background: "rgba(255,255,255,0.08)",
        border: "none",
        borderRadius: "50%",
        width: 48,
        height: 48,
        color: "#fff",
        fontSize: 28,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.2s",
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLElement).style.background =
          "rgba(255,255,255,0.18)";
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLElement).style.background =
          "rgba(255,255,255,0.08)";
      }}
    >
      {dir === "left" ? "\u2039" : "\u203A"}
    </button>
  );
}

function ControlHint({ label, desc }: { label: string; desc: string }) {
  return (
    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
      <span
        style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}
      >
        {label}
      </span>{" "}
      &mdash; {desc}
    </div>
  );
}
