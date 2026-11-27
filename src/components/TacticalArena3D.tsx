/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Three.js 3D Tactical Arena Component with Support for Basketball, Football, and Netball
 * Uganda Christian University (UCU) Sports Department
 */

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { SportType } from '../types';
import { TacticalDrillsOverlay, TACTICAL_DRILLS, TacticalDrill } from './TacticalDrillsOverlay';
import { Compass, ChevronUp, ChevronDown, Pause, Play, RotateCcw } from 'lucide-react';

interface TacticalArena3DProps {
  initialSport?: SportType;
  onClose?: () => void;
}

interface PlayerLabelData {
  id: string;
  name: string;
  num: number;
  x: number;
  y: number;
  isHome: boolean;
}

export const TacticalArena3D: React.FC<TacticalArena3DProps> = ({
  initialSport = 'basketball',
  onClose,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [currentSport, setCurrentSport] = useState<SportType>(initialSport);
  const [cameraView, setCameraView] = useState<'broadcast' | 'overhead' | 'baseline' | 'pov'>('broadcast');
  const [isPlayingTactics, setIsPlayingTactics] = useState(true);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [fpsCount, setFpsCount] = useState('60');
  const [selectedDrillId, setSelectedDrillId] = useState<string>(
    initialSport === 'basketball' ? 'bball_pick_and_roll' : initialSport === 'netball' ? 'netball_centre_pass' : 'football_high_press'
  );
  const [showPlayerLabels, setShowPlayerLabels] = useState(true);
  const [labelScreenPos, setLabelScreenPos] = useState<PlayerLabelData[]>([]);

  const showLabelsRef = useRef(showPlayerLabels);
  showLabelsRef.current = showPlayerLabels;

  // Internal mutable refs for 3D state
  const stateRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    controls?: OrbitControls;
    playersGroup?: THREE.Group;
    courtGroup?: THREE.Group;
    drillsGroup?: THREE.Group;
    targetCamPos: THREE.Vector3;
    targetLookAt: THREE.Vector3;
    animTime: number;
    isPlaying: boolean;
    sport: SportType;
  }>({
    targetCamPos: new THREE.Vector3(0, 22, 28),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    animTime: 0,
    isPlaying: true,
    sport: initialSport,
  });

  // Camera presets
  const applyCameraPreset = (view: 'broadcast' | 'overhead' | 'baseline' | 'pov') => {
    setCameraView(view);
    const isBballOrNetball = stateRef.current.sport === 'basketball' || stateRef.current.sport === 'netball';
    if (view === 'broadcast') {
      stateRef.current.targetCamPos.set(0, isBballOrNetball ? 18 : 26, isBballOrNetball ? 24 : 36);
      stateRef.current.targetLookAt.set(0, 0, 0);
    } else if (view === 'overhead') {
      stateRef.current.targetCamPos.set(0, isBballOrNetball ? 32 : 45, 0.1);
      stateRef.current.targetLookAt.set(0, 0, 0);
    } else if (view === 'baseline') {
      stateRef.current.targetCamPos.set(isBballOrNetball ? -20 : -32, 8, 0);
      stateRef.current.targetLookAt.set(0, 1, 0);
    } else if (view === 'pov') {
      stateRef.current.targetCamPos.set(isBballOrNetball ? -6 : -10, 3, isBballOrNetball ? 7 : 12);
      stateRef.current.targetLookAt.set(isBballOrNetball ? 10 : 16, 2, 0);
    }
  };

  useEffect(() => {
    stateRef.current.sport = currentSport;
    const defaultDrill = TACTICAL_DRILLS.find(d => d.sport === currentSport);
    if (defaultDrill) {
      setSelectedDrillId(defaultDrill.id);
    }
    if (stateRef.current.scene) {
      rebuildArena(currentSport, defaultDrill?.id || selectedDrillId);
    }
  }, [currentSport]);

  useEffect(() => {
    if (stateRef.current.scene) {
      updateDrillPathVisualization(selectedDrillId);
    }
  }, [selectedDrillId]);

  const rebuildArena = (sport: SportType, drillId: string) => {
    const scene = stateRef.current.scene;
    if (!scene) return;

    if (stateRef.current.courtGroup) scene.remove(stateRef.current.courtGroup);
    if (stateRef.current.playersGroup) scene.remove(stateRef.current.playersGroup);
    if (stateRef.current.drillsGroup) scene.remove(stateRef.current.drillsGroup);

    const court = buildCourtGroup(sport);
    const players = buildPlayersGroup(sport);
    const drillsPath = buildDrillsPathGroup(drillId);

    stateRef.current.courtGroup = court;
    stateRef.current.playersGroup = players;
    stateRef.current.drillsGroup = drillsPath;

    scene.add(court);
    scene.add(players);
    scene.add(drillsPath);

    applyCameraPreset(cameraView);
  };

  const updateDrillPathVisualization = (drillId: string) => {
    const scene = stateRef.current.scene;
    if (!scene) return;

    if (stateRef.current.drillsGroup) {
      scene.remove(stateRef.current.drillsGroup);
    }

    const drillsPath = buildDrillsPathGroup(drillId);
    stateRef.current.drillsGroup = drillsPath;
    scene.add(drillsPath);
  };

  const buildDrillsPathGroup = (drillId: string): THREE.Group => {
    const group = new THREE.Group();
    const drill = TACTICAL_DRILLS.find(d => d.id === drillId) || TACTICAL_DRILLS[0];
    if (!drill || !drill.pathPoints || drill.pathPoints.length === 0) return group;

    const points = drill.pathPoints.map(p => new THREE.Vector3(p.x, 0.15, p.z));

    if (points.length >= 2) {
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.08, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.5,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      group.add(tubeMesh);
    }

    points.forEach((pt, idx) => {
      const sphereGeo = new THREE.SphereGeometry(0.25, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: idx === 0 ? 0xfacc15 : idx === points.length - 1 ? 0xef4444 : 0x38bdf8,
        emissive: idx === 0 ? 0xca8a04 : idx === points.length - 1 ? 0xb91c1c : 0x0284c7,
        emissiveIntensity: 1.0,
        roughness: 0.1,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.copy(pt);
      sphere.position.y = 0.3;
      group.add(sphere);

      const ringGeo = new THREE.RingGeometry(0.3, 0.4, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.copy(pt);
      ring.position.y = 0.04;
      group.add(ring);
    });

    return group;
  };

  const createProceduralAthlete = (
    shirtNumber: number,
    name: string,
    teamColor: number,
    accentColor: number,
    isHome: boolean
  ): THREE.Group => {
    const athleteGroup = new THREE.Group();

    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.4);
    const torsoMat = new THREE.MeshStandardMaterial({ color: teamColor, roughness: 0.4, metalness: 0.1 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    athleteGroup.add(torso);

    const collarGeo = new THREE.TorusGeometry(0.2, 0.04, 8, 16);
    const accentMat = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.2, metalness: 0.3 });
    const collar = new THREE.Mesh(collarGeo, accentMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 1.8;
    athleteGroup.add(collar);

    const headGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.7, metalness: 0.05 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.0;
    head.castShadow = true;
    athleteGroup.add(head);

    const shortsGeo = new THREE.BoxGeometry(0.72, 0.5, 0.42);
    const shortsMat = new THREE.MeshStandardMaterial({ color: isHome ? 0x1d4ed8 : 0xffffff, roughness: 0.5 });
    const shorts = new THREE.Mesh(shortsGeo, shortsMat);
    shorts.position.y = 0.75;
    shorts.castShadow = true;
    athleteGroup.add(shorts);

    const legGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.6, 12);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.6 });

    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.2, 0.3, 0);
    leftLeg.castShadow = true;
    athleteGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.2, 0.3, 0);
    rightLeg.castShadow = true;
    athleteGroup.add(rightLeg);

    const shoeGeo = new THREE.BoxGeometry(0.14, 0.12, 0.32);
    const shoeMat = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.3, metalness: 0.4 });
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(-0.2, 0.06, 0.06);
    athleteGroup.add(leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0.2, 0.06, 0.06);
    athleteGroup.add(rightShoe);

    const shadowGeo = new THREE.CircleGeometry(0.55, 16);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false });
    const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = 0.02;
    athleteGroup.add(shadowDisc);

    athleteGroup.userData = { shirtNumber, name, isHome };
    return athleteGroup;
  };

  const buildCourtGroup = (sport: SportType): THREE.Group => {
    const courtGroup = new THREE.Group();

    if (sport === 'basketball') {
      const courtLength = 28;
      const courtWidth = 15;

      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#d97706';
      ctx.fillRect(0, 0, 1024, 512);

      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1;
      for (let y = 0; y < 512; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
      }

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, 964, 452);

      ctx.beginPath();
      ctx.moveTo(512, 30);
      ctx.lineTo(512, 482);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(512, 256, 60, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#1e40af';
      ctx.fillRect(30, 176, 160, 160);
      ctx.strokeRect(30, 176, 160, 160);

      ctx.fillRect(834, 176, 160, 160);
      ctx.strokeRect(834, 176, 160, 160);

      ctx.beginPath();
      ctx.arc(30, 256, 180, -Math.PI / 2.3, Math.PI / 2.3);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(994, 256, 180, Math.PI - Math.PI / 2.3, Math.PI + Math.PI / 2.3);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('UCU CANONS', 512, 256);

      const courtTex = new THREE.CanvasTexture(canvas);
      courtTex.colorSpace = THREE.SRGBColorSpace;

      const floorGeo = new THREE.BoxGeometry(courtLength, 0.4, courtWidth);
      const floorMat = new THREE.MeshStandardMaterial({ map: courtTex, roughness: 0.25, metalness: 0.15 });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.position.y = -0.2;
      floor.receiveShadow = true;
      courtGroup.add(floor);

      const arenaFloorGeo = new THREE.PlaneGeometry(60, 45);
      const arenaFloorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
      const arenaFloor = new THREE.Mesh(arenaFloorGeo, arenaFloorMat);
      arenaFloor.rotation.x = -Math.PI / 2;
      arenaFloor.position.y = -0.22;
      arenaFloor.receiveShadow = true;
      courtGroup.add(arenaFloor);

      const hoopLeft = buildBasketballHoop(-13.5);
      const hoopRight = buildBasketballHoop(13.5);
      hoopRight.rotation.y = Math.PI;
      courtGroup.add(hoopLeft);
      courtGroup.add(hoopRight);

    } else if (sport === 'football') {
      const pitchLength = 48;
      const pitchWidth = 30;

      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 640;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, 1024, 640);

      ctx.fillStyle = '#16a34a';
      for (let x = 0; x < 1024; x += 64) {
        ctx.fillRect(x, 0, 32, 640);
      }

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.strokeRect(30, 30, 964, 580);

      ctx.beginPath();
      ctx.moveTo(512, 30);
      ctx.lineTo(512, 610);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(512, 320, 75, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeRect(30, 170, 140, 300);
      ctx.strokeRect(854, 170, 140, 300);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('UCU CARDINALS', 512, 320);

      const turfTex = new THREE.CanvasTexture(canvas);
      turfTex.colorSpace = THREE.SRGBColorSpace;

      const floorGeo = new THREE.BoxGeometry(pitchLength, 0.4, pitchWidth);
      const floorMat = new THREE.MeshStandardMaterial({ map: turfTex, roughness: 0.7, metalness: 0.05 });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.position.y = -0.2;
      floor.receiveShadow = true;
      courtGroup.add(floor);

      const goalLeft = buildFootballGoal(-23.8);
      const goalRight = buildFootballGoal(23.8);
      goalRight.rotation.y = Math.PI;
      courtGroup.add(goalLeft);
      courtGroup.add(goalRight);

      const trackGeo = new THREE.PlaneGeometry(75, 50);
      const trackMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.85 });
      const track = new THREE.Mesh(trackGeo, trackMat);
      track.rotation.x = -Math.PI / 2;
      track.position.y = -0.22;
      courtGroup.add(track);

    } else if (sport === 'netball') {
      const courtLength = 30.5;
      const courtWidth = 15.25;

      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(0, 0, 1024, 512);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, 964, 452);

      ctx.beginPath();
      ctx.moveTo(351, 30);
      ctx.lineTo(351, 482);
      ctx.moveTo(673, 30);
      ctx.lineTo(673, 482);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(512, 256, 50, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(30, 256, 120, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(994, 256, 120, Math.PI / 2, -Math.PI / 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('UCU NETBALL ARENA', 512, 256);

      const netballTex = new THREE.CanvasTexture(canvas);
      netballTex.colorSpace = THREE.SRGBColorSpace;

      const floorGeo = new THREE.BoxGeometry(courtLength, 0.4, courtWidth);
      const floorMat = new THREE.MeshStandardMaterial({ map: netballTex, roughness: 0.3, metalness: 0.1 });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.position.y = -0.2;
      floor.receiveShadow = true;
      courtGroup.add(floor);

      const arenaFloorGeo = new THREE.PlaneGeometry(65, 45);
      const arenaFloorMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.8 });
      const arenaFloor = new THREE.Mesh(arenaFloorGeo, arenaFloorMat);
      arenaFloor.rotation.x = -Math.PI / 2;
      arenaFloor.position.y = -0.22;
      courtGroup.add(arenaFloor);
    }

    return courtGroup;
  };

  const buildBasketballHoop = (xPos: number): THREE.Group => {
    const hoop = new THREE.Group();

    const postGeo = new THREE.CylinderGeometry(0.12, 0.14, 4.2, 12);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(xPos > 0 ? xPos + 1.2 : xPos - 1.2, 2.1, 0);
    post.castShadow = true;
    hoop.add(post);

    const boardGeo = new THREE.BoxGeometry(0.1, 1.4, 2.0);
    const boardMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.85,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
    });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(xPos, 3.4, 0);
    hoop.add(board);

    const rimGeo = new THREE.TorusGeometry(0.3, 0.03, 8, 16);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, metalness: 0.7, roughness: 0.2 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(xPos > 0 ? xPos - 0.35 : xPos + 0.35, 3.05, 0);
    hoop.add(rim);

    return hoop;
  };

  const buildFootballGoal = (xPos: number): THREE.Group => {
    const goal = new THREE.Group();
    const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.4 });

    const vGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.4, 12);
    const p1 = new THREE.Mesh(vGeo, postMat);
    p1.position.set(xPos, 1.2, -2.5);
    const p2 = new THREE.Mesh(vGeo, postMat);
    p2.position.set(xPos, 1.2, 2.5);
    goal.add(p1, p2);

    const crossGeo = new THREE.CylinderGeometry(0.08, 0.08, 5.0, 12);
    const cross = new THREE.Mesh(crossGeo, postMat);
    cross.rotation.x = Math.PI / 2;
    cross.position.set(xPos, 2.4, 0);
    goal.add(cross);

    return goal;
  };

  const buildPlayersGroup = (sport: SportType): THREE.Group => {
    const group = new THREE.Group();

    if (sport === 'basketball') {
      const ucuStarters = [
        { num: 7, x: -4, z: 0, name: 'Titus Lual (C)' },
        { num: 11, x: -7, z: 3, name: 'Jerry Kayanga (PG)' },
        { num: 10, x: -6, z: -4, name: 'Jimmy Otim (SG)' },
        { num: 5, x: -3, z: 5, name: 'Peter Sifuna (SF)' },
        { num: 14, x: -2, z: -3, name: 'Abraham Deng (PF)' },
      ];

      const opponents = [
        { num: 15, x: -2, z: 1, name: 'KIU #15' },
        { num: 4, x: -5, z: 2, name: 'KIU #4' },
        { num: 8, x: -4, z: -3, name: 'KIU #8' },
        { num: 12, x: -1, z: 4, name: 'KIU #12' },
        { num: 9, x: 0, z: -2, name: 'KIU #9' },
      ];

      ucuStarters.forEach(p => {
        const athlete = createProceduralAthlete(p.num, p.name, 0x1d4ed8, 0xfbbf24, true);
        athlete.position.set(p.x, 0, p.z);
        group.add(athlete);
      });

      opponents.forEach(p => {
        const athlete = createProceduralAthlete(p.num, p.name, 0xdc2626, 0x111827, false);
        athlete.position.set(p.x, 0, p.z);
        group.add(athlete);
      });

      const ballGeo = new THREE.SphereGeometry(0.24, 16, 16);
      const ballMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5, metalness: 0.1 });
      const ball = new THREE.Mesh(ballGeo, ballMat);
      ball.name = 'basketball';
      ball.position.set(-6.5, 1.4, 2.6);
      ball.castShadow = true;
      group.add(ball);

    } else if (sport === 'football') {
      const positions = [
        { num: 1, x: -18, z: 0, name: 'Goalie #1' },
        { num: 2, x: -12, z: -8, name: 'Defender #2' },
        { num: 4, x: -12, z: -3, name: 'Center Back #4' },
        { num: 5, x: -12, z: 3, name: 'Center Back #5' },
        { num: 3, x: -12, z: 8, name: 'Fullback #3' },
        { num: 6, x: -5, z: -4, name: 'Midfielder #6' },
        { num: 8, x: -4, z: 2, name: 'Midfielder #8' },
        { num: 10, x: -2, z: -1, name: 'Playmaker #10' },
        { num: 7, x: 5, z: -9, name: 'Winger #7' },
        { num: 9, x: 8, z: 0, name: 'Allan Okello (#9)' },
        { num: 11, x: 5, z: 9, name: 'Winger #11' },
      ];

      positions.forEach(p => {
        const athlete = createProceduralAthlete(p.num, p.name, 0x1e3a8a, 0xfacc15, true);
        athlete.position.set(p.x, 0, p.z);
        group.add(athlete);
      });

      const ballGeo = new THREE.SphereGeometry(0.22, 16, 16);
      const ballMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.2 });
      const ball = new THREE.Mesh(ballGeo, ballMat);
      ball.name = 'football';
      ball.position.set(7.2, 0.22, 0);
      group.add(ball);

    } else if (sport === 'netball') {
      const netballTeam = [
        { num: 1, x: -10, z: 0, name: 'Sarah Namulondo (GS)' },
        { num: 2, x: -6, z: 3, name: 'Flavia Akello (WA)' },
        { num: 3, x: -3, z: -2, name: 'Center (C)' },
        { num: 4, x: -6, z: -3, name: 'Goal Attack (GA)' },
        { num: 5, x: 2, z: 3, name: 'Wing Defence (WD)' },
        { num: 6, x: 6, z: -2, name: 'Goal Defence (GD)' },
        { num: 7, x: 12, z: 0, name: 'Goal Keeper (GK)' },
      ];

      netballTeam.forEach(p => {
        const athlete = createProceduralAthlete(p.num, p.name, 0x2563eb, 0xfacc15, true);
        athlete.position.set(p.x, 0, p.z);
        group.add(athlete);
      });

      const ballGeo = new THREE.SphereGeometry(0.20, 16, 16);
      const ballMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
      const ball = new THREE.Mesh(ballGeo, ballMat);
      ball.name = 'netball_ball';
      ball.position.set(-3, 1.2, 0);
      group.add(ball);
    }

    return group;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    stateRef.current.scene = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 22, 28);
    stateRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    stateRef.current.renderer = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 6;
    controls.maxDistance = 50;
    stateRef.current.controls = controls;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(15, 30, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0001;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    rimLight.position.set(-20, 15, -20);
    scene.add(rimLight);

    const defaultDrill = TACTICAL_DRILLS.find(d => d.sport === initialSport);
    rebuildArena(initialSport, defaultDrill?.id || selectedDrillId);

    let frameId = 0;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    const tempVector = new THREE.Vector3();

    const animate = (currentTime: number) => {
      frameId = requestAnimationFrame(animate);

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      frameCount++;
      if (currentTime - fpsTimer > 1000) {
        setFpsCount(Math.round((frameCount * 1000) / (currentTime - fpsTimer)).toString());
        frameCount = 0;
        fpsTimer = currentTime;
      }

      if (controls) {
        camera.position.lerp(stateRef.current.targetCamPos, 0.05);
        controls.target.lerp(stateRef.current.targetLookAt, 0.05);
        controls.update();
      }

      if (stateRef.current.isPlaying) {
        stateRef.current.animTime += dt * 1.5;
        const t = stateRef.current.animTime;

        if (stateRef.current.playersGroup) {
          const ball = stateRef.current.playersGroup.getObjectByName('basketball');
          if (ball && stateRef.current.sport === 'basketball') {
            const cycle = Math.sin(t) * 0.5 + 0.5;
            ball.position.x = -6.5 + cycle * 3.5;
            ball.position.z = 2.6 - cycle * 2.2;
            ball.position.y = 0.8 + Math.abs(Math.sin(t * 4)) * 1.2;
          }

          const football = stateRef.current.playersGroup.getObjectByName('football');
          if (football && stateRef.current.sport === 'football') {
            football.position.x = 6.0 + Math.sin(t * 0.8) * 4.0;
            football.position.z = Math.cos(t * 0.8) * 3.0;
            football.position.y = 0.22 + Math.abs(Math.sin(t * 3)) * 0.4;
          }

          const netballBall = stateRef.current.playersGroup.getObjectByName('netball_ball');
          if (netballBall && stateRef.current.sport === 'netball') {
            netballBall.position.x = -3.0 + Math.sin(t * 1.2) * 5.0;
            netballBall.position.z = Math.cos(t * 1.2) * 2.5;
            netballBall.position.y = 1.0 + Math.abs(Math.sin(t * 4)) * 0.8;
          }
        }
      }

      if (showLabelsRef.current && stateRef.current.playersGroup && camera && container) {
        const labels: PlayerLabelData[] = [];
        stateRef.current.playersGroup.children.forEach((child, idx) => {
          if (child instanceof THREE.Group && child.userData.shirtNumber !== undefined) {
            child.getWorldPosition(tempVector);
            tempVector.y += 2.5;
            tempVector.project(camera);
            if (tempVector.z < 1) {
              const x = (tempVector.x * 0.5 + 0.5) * container.clientWidth;
              const y = (-(tempVector.y * 0.5) + 0.5) * container.clientHeight;
              labels.push({
                id: `p_lbl_${idx}`,
                name: child.userData.name || `Player #${child.userData.shirtNumber}`,
                num: child.userData.shirtNumber,
                x,
                y,
                isHome: child.userData.isHome,
              });
            }
          }
        });
        setLabelScreenPos(labels);
      } else {
        setLabelScreenPos([]);
      }

      renderer.render(scene, camera);
    };

    frameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[620px] rounded-3xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-950 select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Player Labels Overlay */}
      {showPlayerLabels && labelScreenPos.map((lbl) => (
        <div
          key={lbl.id}
          className="absolute z-35 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-75"
          style={{ left: `${lbl.x}px`, top: `${lbl.y}px` }}
        >
          <div className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide shadow-xl backdrop-blur-md border flex items-center gap-1.5 ${
            lbl.isHome
              ? 'bg-blue-950/90 text-blue-200 border-blue-500/80 shadow-blue-950/60'
              : 'bg-red-950/90 text-red-200 border-red-500/80 shadow-red-950/60'
          }`}>
            <span className="font-mono text-amber-400 bg-black/40 px-1 rounded">#{lbl.num}</span>
            <span>{lbl.name}</span>
          </div>
        </div>
      ))}

      {/* Top Floating Badge Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2.5">
        <div className="bg-slate-900/90 text-white border border-slate-700/80 px-4 py-2 rounded-2xl shadow-lg backdrop-blur-xs flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-400" />
          <span className="font-extrabold text-xs tracking-wide uppercase font-['Barlow_Condensed']">
            UCU 3D Tactical Arena
          </span>
          <span className="text-[11px] text-blue-400 font-mono">
            {currentSport === 'basketball' ? 'Mukono Courts' : currentSport === 'netball' ? 'Indoor Netball Arena' : 'Varsity Stadium'}
          </span>
        </div>

        <div className="bg-slate-900/80 text-emerald-400 border border-slate-700/80 px-3 py-1.5 rounded-2xl shadow-md text-xs font-mono font-bold">
          {fpsCount} FPS
        </div>
      </div>

      {/* Tactical Drills Selector Overlay */}
      <TacticalDrillsOverlay
        sport={currentSport}
        selectedDrillId={selectedDrillId}
        onSelectDrill={(drill) => setSelectedDrillId(drill.id)}
      />

      {/* Close button if presented in modal mode */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-20 z-20 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center font-bold text-sm shadow-lg transition-colors"
        >
          ✕
        </button>
      )}

      {/* Unified Bottom Control Dock */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-3xl flex flex-col items-center">
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 px-3 py-1 rounded-t-xl text-[11px] font-bold shadow-md flex items-center gap-1 transition-colors"
        >
          {isDockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Show Tactical Controls (H)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Hide Dock</span>
            </>
          )}
        </button>

        {!isDockCollapsed && (
          <div className="w-full bg-slate-900/95 border border-slate-700/90 rounded-2xl p-3.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setCurrentSport('basketball')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  currentSport === 'basketball'
                    ? 'bg-[#2954ea] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🏀 Canons Court
              </button>
              <button
                onClick={() => setCurrentSport('football')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  currentSport === 'football'
                    ? 'bg-[#2954ea] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚽ Cardinals Pitch
              </button>
              <button
                onClick={() => setCurrentSport('netball')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  currentSport === 'netball'
                    ? 'bg-[#2954ea] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🏐 Netball Court
              </button>
            </div>

            <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-slate-300">
              <span className="text-[10px] uppercase font-bold text-slate-500 px-2">Cam:</span>
              <button
                onClick={() => applyCameraPreset('broadcast')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  cameraView === 'broadcast' ? 'bg-white text-slate-900 font-bold' : 'hover:text-white'
                }`}
              >
                Broadcast
              </button>
              <button
                onClick={() => applyCameraPreset('overhead')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  cameraView === 'overhead' ? 'bg-white text-slate-900 font-bold' : 'hover:text-white'
                }`}
              >
                Overhead
              </button>
              <button
                onClick={() => applyCameraPreset('baseline')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  cameraView === 'baseline' ? 'bg-white text-slate-900 font-bold' : 'hover:text-white'
                }`}
              >
                Baseline
              </button>
              <button
                onClick={() => applyCameraPreset('pov')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  cameraView === 'pov' ? 'bg-white text-slate-900 font-bold' : 'hover:text-white'
                }`}
              >
                Player POV
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPlayerLabels(!showPlayerLabels)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 ${
                  showPlayerLabels
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
                }`}
              >
                <span>🏷️ Labels: {showPlayerLabels ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => {
                  const nextState = !isPlayingTactics;
                  setIsPlayingTactics(nextState);
                  stateRef.current.isPlaying = nextState;
                }}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  isPlayingTactics
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                {isPlayingTactics ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlayingTactics ? 'Pause' : 'Run'}</span>
              </button>

              <button
                onClick={() => {
                  stateRef.current.animTime = 0;
                  applyCameraPreset('broadcast');
                }}
                title="Reset Camera & Play"
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
