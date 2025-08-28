'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface City {
  id: number;
  name: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  propName: string;
}

interface Payment {
  id: string;
  fromCity: City;
  toCity: { lat: number; lng: number; name: string };
  timestamp: Date;
  status: 'pending' | 'completed';
}

interface GlobeViewerProps {
  onConnectionChange: (connected: boolean) => void;
  onPaymentCountChange: (count: number) => void;
}

export default function GlobeViewer({ onConnectionChange, onPaymentCountChange }: GlobeViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const citiesRef = useRef<City[]>([]);
  const cityPinsRef = useRef<THREE.Group | null>(null);
  const arrowsRef = useRef<THREE.Group | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [paymentCount, setPaymentCount] = useState(0);

  // 도시 데이터
  const cities: City[] = [
    { id: 1, name: "Charleston", country: "United States", city: "Charleston, South Carolina", lat: 32.7765, lng: -79.9311, propName: "North Korean Army Airborne Glider Infantry Badge Pin" },
    { id: 2, name: "Netania", country: "Israel", city: "Netania", lat: 32.3328, lng: 34.8600, propName: "North Korea Badge" },
    { id: 3, name: "Zagreb", country: "Republic of Croatia", city: "Zagreb", lat: 45.8150, lng: 15.9819, propName: "Vintage North Korea badge ZENLAM Space programm" },
    { id: 4, name: "Sofia", country: "Bulgaria", city: "Sofia city", lat: 42.6977, lng: 23.3219, propName: "1980's DPRK Korea Military Army pin badge" },
    { id: 5, name: "Middelburg", country: "Netherlands", city: "Middelburg", lat: 51.5000, lng: 3.6100, propName: "2002 - 5.000 Won (46b) Regular - Kim Il Sung" },
    { id: 6, name: "Bucharest", country: "Romania", city: "bucharest", lat: 44.4268, lng: 26.1025, propName: "North Korean old brooch pin" },
    { id: 7, name: "Mrázov", country: "Czech Republic", city: "Mrázov", lat: 49.8175, lng: 12.7000, propName: "Propaganda Music Of North Korea" },
    { id: 8, name: "Sutton", country: "United Kingdom", city: "Sutton", lat: 51.3600, lng: -0.2000, propName: "DPRK 1969 Vintage Photo Postcards Set" },
    { id: 9, name: "Kochi", country: "Japan", city: "Kochi", lat: 33.5588, lng: 133.5314, propName: "우리 나라 민속무용" },
    { id: 10, name: "Liaoning", country: "China", city: "Liaoning", lat: 41.8057, lng: 123.4315, propName: "스틸 쿼츠 시계" },
  ];

  // Three.js 씬 초기화
  useEffect(() => {
    if (!mountRef.current) return;

    // 씬 생성
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 카메라 생성 - 세로형 모니터에 최적화
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 2.5);  // Y축으로 2로 설정하여 지구본을 위에서 보는 각도
    cameraRef.current = camera;

    // 렌더러 생성
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x0f172a, 1);
    renderer.shadowMap.enabled = false;  // 그림자 맵 완전 비활성화
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 컨트롤 생성
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controls.minDistance = 1.5;
    controls.maxDistance = 5;
    controlsRef.current = controls;

    // 지구 텍스처 로드
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/earthmap4k.jpg');
    
    // 지구본 생성 - 실제 지구 텍스처 사용, 완전 불투명
    const globeGeometry = new THREE.SphereGeometry(1, 128, 128);
    const globeMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 50,  // 더 반짝이게
      emissive: 0x111111,  // 약간의 자체 발광으로 더 밝게
    });
    
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    globe.castShadow = false;  // 그림자 생성 안함
    globe.receiveShadow = false; // 그림자 받지 않음
    
    // 지구본 원래 각도로 설정
    globe.rotation.y = 0; // 기본 각도
    
    scene.add(globe);
    globeRef.current = globe;

    // 대기권 효과
    const atmosphereGeometry = new THREE.SphereGeometry(1.05, 128, 128);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.castShadow = false;  // 그림자 생성 안함
    atmosphere.receiveShadow = false; // 그림자 받지 않음
    scene.add(atmosphere);

    // 조명 추가 - 구글 어스처럼 고정된 방향에서 비추도록 설정
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);  // 전체적으로 밝게
    scene.add(ambientLight);

    // 태양 빛처럼 고정된 방향에서 비추는 조명
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 5, 10);  // 고정된 위치
    directionalLight.castShadow = false;  // 그림자 생성 안함
    scene.add(directionalLight);

    // 별들 추가
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
      transparent: true,
      opacity: 0.8
    });

    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    // Points는 그림자 설정이 필요 없음
    scene.add(stars);

    // 도시 핀 그룹 생성 - 지구본의 자식으로 추가하여 회전 동기화
    const cityPins = new THREE.Group();
    globe.add(cityPins); // 지구본의 자식으로 추가
    cityPinsRef.current = cityPins;

    // 화살표 그룹 생성 - 지구본의 자식으로 추가하여 회전 동기화
    const arrows = new THREE.Group();
    globe.add(arrows); // 지구본의 자식으로 추가
    arrowsRef.current = arrows;

    // 도시 핀 추가
    addCityPins(cities);
    
    // 서울 핀 추가 (특별한 노란색 핀)
    addSeoulPin();

    // 애니메이션 루프
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // 지구본 회전
      if (globeRef.current) {
        globeRef.current.rotation.y += 0.001;
      }

      // 도시 핀 깜빡임 효과 (회전과 독립적으로)
      if (cityPinsRef.current) {
        cityPinsRef.current.children.forEach((pin, index) => {
          if (pin instanceof THREE.Mesh && pin.material instanceof THREE.MeshBasicMaterial) {
            const time = Date.now() * 0.001;
            const scale = 1 + 0.1 * Math.sin(time * 2 + index);
            pin.scale.setScalar(scale);
          }
        });
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 윈도우 리사이즈 핸들러
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // 클린업
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // 도시 핀 추가 함수 - 정확한 위치 계산
  const addCityPins = useCallback((cities: City[]) => {
    if (!cityPinsRef.current) return;

    cities.forEach((city) => {
      // 핀 생성 - 더 현실적인 디자인
      const pinGroup = new THREE.Group();
      
      // 핀 본체
      const pinGeometry = new THREE.ConeGeometry(0.02, 0.08, 8);
      const pinMaterial = new THREE.MeshBasicMaterial({ color: 0xff69b4 });
      const pin = new THREE.Mesh(pinGeometry, pinMaterial);
      pin.castShadow = false;  // 그림자 생성 안함
      pin.receiveShadow = false; // 그림자 받지 않음
      pinGroup.add(pin);
      
      // 핀 머리
      const headGeometry = new THREE.SphereGeometry(0.025, 8, 8);
      const headMaterial = new THREE.MeshBasicMaterial({ color: 0xff1493 });
      const head = new THREE.Mesh(headGeometry, headMaterial);
      head.castShadow = false;  // 그림자 생성 안함
      head.receiveShadow = false; // 그림자 받지 않음
      head.position.y = 0.06;
      pinGroup.add(head);
      
      // 빛나는 효과
      const glowGeometry = new THREE.SphereGeometry(0.04, 8, 8);
      const glowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff69b4, 
        transparent: true, 
        opacity: 0.3 
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.castShadow = false;  // 그림자 생성 안함
      glow.receiveShadow = false; // 그림자 받지 않음
      glow.position.y = 0.06;
      pinGroup.add(glow);

      // 위도/경도를 3D 좌표로 변환 - 텍스처에 맞게 조정
      const lat = city.lat * (Math.PI / 180);
      const lng = city.lng * (Math.PI / 180);
      
      // 지구본 표면에서 약간 바깥쪽에 위치시키기 (1.02배)
      // 경도를 음수로 변환하여 서쪽 경도로 계산 (서울 핀과 동일한 방식)
      const x = Math.cos(lat) * Math.cos(-lng) * 1.02;
      const y = Math.sin(lat) * 1.02;
      const z = Math.cos(lat) * Math.sin(-lng) * 1.02;
      
      pinGroup.position.set(x, y, z);

      // 핀을 지구본 표면에 수직으로 배치
      pinGroup.lookAt(0, 0, 0);
      pinGroup.rotateX(Math.PI / 2);

      // 도시 정보를 핀에 저장
      pinGroup.userData = { city };

      cityPinsRef.current!.add(pinGroup);
    });
  }, []);

  // 서울 핀 추가 함수
  const addSeoulPin = useCallback(() => {
    if (!cityPinsRef.current) return;

    // 서울 핀 생성 - 특별한 노란색 디자인
    const seoulPinGroup = new THREE.Group();
    
    // 서울 핀 본체 (더 큰 크기)
    const seoulPinGeometry = new THREE.ConeGeometry(0.03, 0.12, 8);
    const seoulPinMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 }); // 황금색
    const seoulPin = new THREE.Mesh(seoulPinGeometry, seoulPinMaterial);
    seoulPin.castShadow = false;  // 그림자 생성 안함
    seoulPin.receiveShadow = false; // 그림자 받지 않음
    seoulPinGroup.add(seoulPin);
    
    // 서울 핀 머리 (더 큰 크기)
    const seoulHeadGeometry = new THREE.SphereGeometry(0.035, 8, 8);
    const seoulHeadMaterial = new THREE.MeshBasicMaterial({ color: 0xff8c00 }); // 주황색
    const seoulHead = new THREE.Mesh(seoulHeadGeometry, seoulHeadMaterial);
    seoulHead.castShadow = false;  // 그림자 생성 안함
    seoulHead.receiveShadow = false; // 그림자 받지 않음
    seoulHead.position.y = 0.09;
    seoulPinGroup.add(seoulHead);
    
    // 서울 핀 빛나는 효과 (더 큰 크기)
    const seoulGlowGeometry = new THREE.SphereGeometry(0.06, 8, 8);
    const seoulGlowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffd700, 
      transparent: true, 
      opacity: 0.4 
    });
    const seoulGlow = new THREE.Mesh(seoulGlowGeometry, seoulGlowMaterial);
    seoulGlow.castShadow = false;  // 그림자 생성 안함
    seoulGlow.receiveShadow = false; // 그림자 받지 않음
    seoulGlow.position.y = 0.09;
    seoulPinGroup.add(seoulGlow);

    // 서울 좌표 (37.5665, 126.9780)
    const seoulLat = 37.5665 * (Math.PI / 180);
    const seoulLng = 126.9780 * (Math.PI / 180);
    
    // 서울 핀을 지구본 표면에서 약간 바깥쪽에 위치시키기 (1.02배)
    // 경도를 음수로 변환하여 서쪽 경도로 계산
    const x = Math.cos(seoulLat) * Math.cos(-seoulLng) * 1.02;
    const y = Math.sin(seoulLat) * 1.02;
    const z = Math.cos(seoulLat) * Math.sin(-seoulLng) * 1.02;
    
    seoulPinGroup.position.set(x, y, z);

    // 서울 핀을 지구본 표면에 수직으로 배치
    seoulPinGroup.lookAt(0, 0, 0);
    seoulPinGroup.rotateX(Math.PI / 2);

    // 서울 정보를 핀에 저장
    seoulPinGroup.userData = { 
      city: { 
        name: "Seoul", 
        country: "South Korea", 
        city: "Seoul, South Korea",
        lat: 37.5665,
        lng: 126.9780,
        propName: "도착지"
      } 
    };

    cityPinsRef.current.add(seoulPinGroup);
  }, []);

  // 결제 화살표 추가 함수 - 정확한 위치 계산
  const addPaymentArrow = useCallback((payment: Payment) => {
    if (!arrowsRef.current) return;

    // 출발지와 도착지(서울) 좌표
    const fromLat = payment.fromCity.lat;
    const fromLng = payment.fromCity.lng;
    const toLat = 37.5665; // 서울 위도
    const toLng = 126.9780; // 서울 경도

    // 3D 좌표로 변환 - 정확한 계산
    const fromLatRad = fromLat * (Math.PI / 180);
    const fromLngRad = fromLng * (Math.PI / 180);
    const toLatRad = toLat * (Math.PI / 180);
    const toLngRad = toLng * (Math.PI / 180);

    // 출발지와 도착지의 정확한 3D 좌표
    const fromX = Math.cos(fromLatRad) * Math.cos(fromLngRad);
    const fromY = Math.sin(fromLatRad);
    const fromZ = Math.cos(fromLatRad) * Math.sin(fromLngRad);

    const toX = Math.cos(toLatRad) * Math.cos(toLngRad);
    const toY = Math.sin(toLatRad);
    const toZ = Math.cos(toLatRad) * Math.sin(toLngRad);

    // 화살표 생성 - 더 현실적인 곡선
    const arrowGeometry = new THREE.BufferGeometry();
    const points = [];
    const segments = 100;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      
      // 직선 보간
      const x = fromX + (toX - fromX) * t;
      const y = fromY + (toY - fromY) * t;
      const z = fromZ + (toZ - fromZ) * t;
      
      // 곡선 효과를 위해 약간 위로 올림 (지구본 표면에서)
      const height = 0.3 * Math.sin(Math.PI * t);
      const normalized = new THREE.Vector3(x, y, z).normalize();
      
      points.push(
        normalized.x * (1 + height),
        normalized.y * (1 + height),
        normalized.z * (1 + height)
      );
    }

    arrowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    const arrowMaterial = new THREE.LineBasicMaterial({ 
      color: 0xff69b4, 
      linewidth: 3,
      transparent: true,
      opacity: 0.9
    });

    const arrow = new THREE.Line(arrowGeometry, arrowMaterial);
    arrow.userData = { payment, createdAt: Date.now() };

    arrowsRef.current.add(arrow);

    // 결제 카운트 업데이트
    const newCount = paymentCount + 1;
    setPaymentCount(newCount);
    onPaymentCountChange(newCount);

    // 8초 후 화살표 제거
    setTimeout(() => {
      if (arrowsRef.current && arrow.parent) {
        arrowsRef.current.remove(arrow);
      }
    }, 8000);
  }, [paymentCount, onPaymentCountChange]);

  // 결제 이벤트 리스너
  useEffect(() => {
    const handlePayment = (event: CustomEvent) => {
      const payment: Payment = event.detail;
      addPaymentArrow(payment);
    };

    window.addEventListener('payment-completed', handlePayment as EventListener);

    return () => {
      window.removeEventListener('payment-completed', handlePayment as EventListener);
    };
  }, [addPaymentArrow]);

  // WebSocket 연결 상태 시뮬레이션
  useEffect(() => {
    const timer = setTimeout(() => {
      onConnectionChange(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onConnectionChange]);

  return (
    <div ref={mountRef} className="w-full h-full" />
  );
}
