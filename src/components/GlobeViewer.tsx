'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import propsData from '@/data/props.json';
import GlobePaymentMonitorService, { CompletedPayment } from '@/services/globePaymentMonitorService';
import OrderCompleteModal from './OrderCompleteModal';

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

interface OrderInfo {
  propName: string;
  orderTime: string;
  origin: string;
  shippingDays: string;
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
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [currentOrderInfo, setCurrentOrderInfo] = useState<OrderInfo | null>(null);
  
  // 결제 모니터링 서비스
  const paymentPollingServiceRef = useRef<GlobePaymentMonitorService | null>(null);
  
  // 이미지와 텍스트 메시를 저장할 ref
  const vaticanImageRef = useRef<THREE.Mesh | null>(null);
  const vaticanText1Ref = useRef<THREE.Mesh | null>(null);
  const vaticanText2Ref = useRef<THREE.Mesh | null>(null);
  const vaticanDeliveryRef = useRef<THREE.Mesh | null>(null);
  
  // 베이징 이미지와 텍스트 메시를 저장할 ref
  const beijingImageRef = useRef<THREE.Mesh | null>(null);
  const beijingText1Ref = useRef<THREE.Mesh | null>(null);
  const beijingText2Ref = useRef<THREE.Mesh | null>(null);
  const beijingDeliveryRef = useRef<THREE.Mesh | null>(null);

  // 모든 상품에 대한 ref 추가
  const kochiImageRef = useRef<THREE.Mesh | null>(null);
  const kochiTextRef = useRef<THREE.Mesh | null>(null);
  const charlestonImageRef = useRef<THREE.Mesh | null>(null);
  const charlestonTextRef = useRef<THREE.Mesh | null>(null);
  const netaniaImageRef = useRef<THREE.Mesh | null>(null);
  const netaniaTextRef = useRef<THREE.Mesh | null>(null);
  const zagrebImageRef = useRef<THREE.Mesh | null>(null);
  const zagrebTextRef = useRef<THREE.Mesh | null>(null);
  const sofiaImageRef = useRef<THREE.Mesh | null>(null);
  const sofiaTextRef = useRef<THREE.Mesh | null>(null);
  const middelburgImageRef = useRef<THREE.Mesh | null>(null);
  const middelburgTextRef = useRef<THREE.Mesh | null>(null);
  const bucharestImageRef = useRef<THREE.Mesh | null>(null);
  const bucharestTextRef = useRef<THREE.Mesh | null>(null);
  const mrazovImageRef = useRef<THREE.Mesh | null>(null);
  const mrazovTextRef = useRef<THREE.Mesh | null>(null);
  const suttonImageRef = useRef<THREE.Mesh | null>(null);
  const suttonTextRef = useRef<THREE.Mesh | null>(null);
  const liaoningImageRef = useRef<THREE.Mesh | null>(null);
  const liaoningTextRef = useRef<THREE.Mesh | null>(null);

  // 결제 완료 이벤트 처리 함수
  const handleNewPayment = useCallback((payment: CompletedPayment) => {
    console.log('🎉 새로운 결제 감지됨:', payment);
    
    // memo 필드에서 상품명 추출 (goodname 대신 memo 사용)
    const productName = payment.memo;
    console.log('🔍 상품명 추출:', productName);
    
    // props.json에서 해당 상품 찾기 (부분 매칭 추가)
    const matchedProp = propsData.props.find(prop => 
      prop.name === productName ||                    // 정확한 매칭
      prop.name.includes(productName) ||              // props.json에 상품명이 포함
      productName.includes(prop.name)                 // 상품명에 props.json이 포함
    );
    
    console.log('🔍 상품 매칭 결과:', matchedProp);
    
    if (matchedProp) {
      console.log('✅ 상품 매칭 성공! 3가지 효과 시작...');
      
      // 1️⃣ 주문 완료 모달 표시
      const orderInfo: OrderInfo = {
        propName: productName,
        orderTime: payment.created_at,
        origin: `${matchedProp.origin.city}, ${matchedProp.origin.country}`,
        shippingDays: matchedProp.shippingDays
      };
      
      setCurrentOrderInfo(orderInfo);
      setOrderModalVisible(true);
      
      // 2️⃣ 해당 상품 이미지 위에 '주문 완료' 텍스트 애니메이션
      triggerOrderCompleteAnimation(matchedProp.name);
      
      // 3️⃣ 해당 상품의 도시 핀부터 서울까지 점선 애니메이션
      triggerDeliveryRouteAnimation(matchedProp);
      
    } else {
      console.log('❌ 상품 매칭 실패:', productName);
    }
  }, []);

  // 주문 완료 애니메이션 트리거 함수
  const triggerOrderCompleteAnimation = useCallback((propName: string) => {
    // props.json에서 해당 상품의 위치 정보 찾기
    const matchedProp = propsData.props.find(prop => prop.name === propName);
    if (!matchedProp) return;
    
    console.log('🎬 애니메이션 시작:', matchedProp.name, '위치:', matchedProp.origin.city);
    
    // 동적으로 모든 상품의 위치를 찾아서 애니메이션 적용
    const cityName = matchedProp.origin.city;
    
    // 모든 상품의 ref를 배열로 관리
    const allRefs = [
      { city: "Vatican City", imageRef: vaticanImageRef, textRef: vaticanText1Ref },
      { city: "Beijing", imageRef: beijingImageRef, textRef: beijingText1Ref },
      { city: "Kochi", imageRef: kochiImageRef, textRef: kochiTextRef },
      { city: "Charleston, South Carolina", imageRef: charlestonImageRef, textRef: charlestonTextRef },
      { city: "Netania", imageRef: netaniaImageRef, textRef: netaniaTextRef },
      { city: "Zagreb", imageRef: zagrebImageRef, textRef: zagrebTextRef },
      { city: "Sofia city", imageRef: sofiaImageRef, textRef: sofiaTextRef },
      { city: "Middelburg", imageRef: middelburgImageRef, textRef: middelburgTextRef },
      { city: "bucharest", imageRef: bucharestImageRef, textRef: bucharestTextRef },
      { city: "Mrázov", imageRef: mrazovImageRef, textRef: mrazovTextRef },
      { city: "Sutton", imageRef: suttonImageRef, textRef: suttonTextRef },
      { city: "Liaoning", imageRef: liaoningImageRef, textRef: liaoningTextRef }
    ];
    
    // 매칭되는 ref 찾기
    const matchedRef = allRefs.find(ref => ref.city === cityName);
    
    if (matchedRef && matchedRef.imageRef.current && matchedRef.textRef.current) {
      applyOrderCompleteAnimation(matchedRef.imageRef.current, matchedRef.textRef.current);
      console.log('✅ 애니메이션 적용 완료:', cityName);
    } else {
      console.log('⚠️ 애니메이션 ref를 찾을 수 없음:', cityName);
    }
  }, []);

  // 배송 경로 애니메이션 트리거 함수
  const triggerDeliveryRouteAnimation = useCallback((matchedProp: any) => {
    console.log('🚚 배송 경로 애니메이션 시작:', matchedProp.name, '위치:', matchedProp.origin.city);
    
    // 해당 상품의 도시 정보로 점선 생성
    const cityInfo = {
      lat: getCityLatitude(matchedProp.origin.city),
      lng: getCityLongitude(matchedProp.origin.city),
      name: matchedProp.origin.city,
      country: matchedProp.origin.country
    };
    
    // 서울까지 점선 추가 (함수 정의 후에 호출)
    setTimeout(() => {
      if (typeof addDottedLineToSeoul === 'function') {
        addDottedLineToSeoul(cityInfo);
        console.log('✅ 배송 경로 점선 추가 완료:', cityInfo.name);
      }
    }, 100);
  }, []);

  // 도시별 위도/경도 정보 반환 함수
  const getCityLatitude = useCallback((cityName: string): number => {
    const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
      "Vatican City": { lat: 41.9022, lng: 12.4539 },
      "Beijing": { lat: 39.9042, lng: 116.4074 },
      "Kochi": { lat: 33.5588, lng: 133.5314 },
      "Charleston, South Carolina": { lat: 32.7765, lng: -79.9311 },
      "Netania": { lat: 32.3328, lng: 34.8600 },
      "Zagreb": { lat: 45.8150, lng: 15.9819 },
      "Sofia city": { lat: 42.6977, lng: 23.3219 },
      "Middelburg": { lat: 51.5000, lng: 3.6100 },
      "bucharest": { lat: 44.4268, lng: 26.1025 },
      "Mrázov": { lat: 49.8175, lng: 12.7000 },
      "Sutton": { lat: 51.3600, lng: -0.2000 },
      "Liaoning": { lat: 41.8057, lng: 123.4315 }
    };
    
    return cityCoordinates[cityName]?.lat || 0;
  }, []);

  const getCityLongitude = useCallback((cityName: string): number => {
    const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
      "Vatican City": { lat: 41.9022, lng: 12.4539 },
      "Beijing": { lat: 39.9042, lng: 116.4074 },
      "Kochi": { lat: 33.5588, lng: 133.5314 },
      "Charleston, South Carolina": { lat: 32.7765, lng: -79.9311 },
      "Netania": { lat: 32.3328, lng: 34.8600 },
      "Zagreb": { lat: 45.8150, lng: 15.9819 },
      "Sofia city": { lat: 42.6977, lng: 23.3219 },
      "Middelburg": { lat: 51.5000, lng: 3.6100 },
      "bucharest": { lat: 44.4268, lng: 26.1025 },
      "Mrázov": { lat: 49.8175, lng: 12.7000 },
      "Sutton": { lat: 51.3600, lng: -0.2000 },
      "Liaoning": { lat: 41.8057, lng: 123.4315 }
    };
    
    return cityCoordinates[cityName]?.lng || 0;
  }, []);

  // 주문 완료 애니메이션 적용 함수
  const applyOrderCompleteAnimation = useCallback((imageMesh: THREE.Mesh, textMesh: THREE.Mesh) => {
    // 분홍 바탕 + 검정 텍스트로 '주문 완료' 애니메이션 생성
    const orderCompleteCanvas = document.createElement('canvas');
    const ctx = orderCompleteCanvas.getContext('2d');
    orderCompleteCanvas.width = 256;
    orderCompleteCanvas.height = 64;
    
    if (ctx) {
      // 깜빡이는 애니메이션을 위한 함수
      const animateOrderComplete = () => {
        const alpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.01); // 깜빡임 효과
        
        ctx.clearRect(0, 0, orderCompleteCanvas.width, orderCompleteCanvas.height);
        ctx.fillStyle = `rgba(236, 72, 153, ${alpha})`; // 분홍 바탕
        ctx.fillRect(0, 0, orderCompleteCanvas.width, orderCompleteCanvas.height);
        
        ctx.fillStyle = '#000000'; // 검정 텍스트
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('주문 완료', orderCompleteCanvas.width / 2, orderCompleteCanvas.height / 2);
        
        // 텍스처 업데이트
        if (textMesh.material instanceof THREE.MeshBasicMaterial && textMesh.material.map) {
          textMesh.material.map.needsUpdate = true;
        }
        
        // 애니메이션 계속
        requestAnimationFrame(animateOrderComplete);
      };
      
      // 애니메이션 시작
      animateOrderComplete();
      
      // 10초 후 애니메이션 중지
      setTimeout(() => {
        // 원래 텍스트로 복원
        if (textMesh.material instanceof THREE.MeshBasicMaterial && textMesh.material.map) {
          textMesh.material.map.needsUpdate = true;
        }
      }, 10000);
    }
  }, []);

  // props.json에서 도시 데이터를 동적으로 생성
  const cities: City[] = propsData.props.map((prop, index) => {
    // props.json의 origin 정보를 기반으로 도시 정보 생성
    const cityInfo = {
      id: index + 1,
      name: prop.origin.city === "Vatican City" ? "Piazza San Pietro" : prop.origin.city,
      country: prop.origin.country,
      city: prop.origin.city,
      propName: prop.name
    };

    // 위도/경도 정보 (기존 하드코딩된 값들을 사용)
    const coordinates: { [key: string]: { lat: number; lng: number } } = {
      "Charleston, South Carolina": { lat: 32.7765, lng: -79.9311 },
      "Netania": { lat: 32.3328, lng: 34.8600 },
      "Zagreb": { lat: 45.8150, lng: 15.9819 },
      "Sofia city": { lat: 42.6977, lng: 23.3219 },
      "Middelburg": { lat: 51.5000, lng: 3.6100 },
      "bucharest": { lat: 44.4268, lng: 26.1025 },
      "Mrázov": { lat: 49.8175, lng: 12.7000 },
      "Sutton": { lat: 51.3600, lng: -0.2000 },
      "Kochi": { lat: 33.5588, lng: 133.5314 },
      "Liaoning": { lat: 41.8057, lng: 123.4315 },
      "Vatican City": { lat: 41.9022, lng: 12.4539 },
      "Beijing": { lat: 39.9042, lng: 116.4074 }
    };

    const coords = coordinates[prop.origin.city] || { lat: 0, lng: 0 };
    
    return {
      ...cityInfo,
      lat: coords.lat,
      lng: coords.lng
    };
  });

  // Three.js 씬 초기화
  useEffect(() => {
    if (!mountRef.current) return;

    // 씬 생성
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 카메라 생성 - 상하로 늘린 화면에 최적화
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerHeight / window.innerWidth,
      0.1,
      1000
    );
    camera.position.set(0, 2, 3.5);  // Z축을 2.5에서 3.5로 늘려서 지구본을 덜 확대
    cameraRef.current = camera;

    // 렌더러 생성
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerHeight, window.innerWidth);
    renderer.setClearColor(0x1a1a1a, 1);
    renderer.shadowMap.enabled = false;  // 그림자 맵 완전 비활성화
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 컨트롤 생성
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controls.minDistance = 2.5;  // 최소 거리를 늘려서 너무 가깝게 확대되지 않도록
    controls.maxDistance = 7;    // 최대 거리를 늘려서 더 멀리 볼 수 있도록
    controlsRef.current = controls;

    // 지구 텍스처 로드
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/earthmap4k_pink2.jpg');
    
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
    
    // 지구본을 화면 하단에 배치하여 북반구 상단 2/3만 보이게 함
    globe.position.set(0, -1, 0);
    
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
    
    // Piazza San Pietro에서 서울까지 지구 외곽을 따라 이어지는 선 추가
    addVaticanToSeoulLine();
    
    // 베이징에서 서울까지 지구 외곽을 따라 이어지는 선 추가
    addBeijingToSeoulLine();
    
    // 모든 props에 대해 이미지와 텍스트 추가
    addAllPropsImagesAndText();
    
    // 바티칸 이미지와 텍스트 추가
    addVaticanImageAndText();
    
    // 베이징 이미지와 텍스트 추가
    addBeijingImageAndText();

    // 애니메이션 루프
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // 지구본 회전
      if (globeRef.current) {
        globeRef.current.rotation.y += 0.001;
      }

      // 모든 이미지와 텍스트들이 항상 카메라를 향하도록 업데이트
      if (globeRef.current) {
        globeRef.current.children.forEach(child => {
          if (child instanceof THREE.Mesh && child.material && child.material.map) {
            child.lookAt(camera.position);
          }
        });
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
      if (!camera || !renderer) return;
      
      camera.aspect = window.innerHeight / window.innerWidth;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerHeight, window.innerWidth);
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
      // 핀 생성 - 새로운 디자인
      const pinGroup = new THREE.Group();
      
      // 핀 본체 (원통형 기둥)
      const pinGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8);
      const pinMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
      const pin = new THREE.Mesh(pinGeometry, pinMaterial);
      pin.castShadow = false;
      pin.receiveShadow = false;
      pinGroup.add(pin);
      
      // 핀 머리 (구) - 바티칸과 베이징은 진한 회색, 나머지는 일반 회색
      const headGeometry = new THREE.SphereGeometry(0.02, 8, 8);
      const headColor = (city.name === "Piazza San Pietro" || city.name === "Beijing") ? 0x444444 : 0x888888;
      const headMaterial = new THREE.MeshBasicMaterial({ color: headColor });
      const head = new THREE.Mesh(headGeometry, headMaterial);
      head.castShadow = false;
      head.receiveShadow = false;
      head.position.y = 0.06;
      pinGroup.add(head);

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
      // 지구 표면에 수직으로 서도록 회전 조정
      pinGroup.rotateX(-Math.PI / 2);

      // 도시 정보를 핀에 저장
      pinGroup.userData = { city };

      cityPinsRef.current!.add(pinGroup);
    });
  }, []);

  // 서울 핀 추가 함수
  const addSeoulPin = useCallback(() => {
    if (!cityPinsRef.current) return;

    // 서울 핀 생성 - 일반적인 핀 모양 (빨간 구 + 회색 기둥)
    const seoulPinGroup = new THREE.Group();
    
    // 서울 핀 본체 (회색 기둥)
    const seoulPinGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8);
    const seoulPinMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 }); // 회색
    const seoulPin = new THREE.Mesh(seoulPinGeometry, seoulPinMaterial);
    seoulPin.castShadow = false;
    seoulPin.receiveShadow = false;
    seoulPinGroup.add(seoulPin);
    
    // 서울 핀 머리 (빨간 구)
    const seoulHeadGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    const seoulHeadMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // 빨간색
    const seoulHead = new THREE.Mesh(seoulHeadGeometry, seoulHeadMaterial);
    seoulHead.castShadow = false;
    seoulHead.receiveShadow = false;
    seoulHead.position.y = 0.06;
    seoulPinGroup.add(seoulHead);

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
    // 지구 표면에 수직으로 서도록 회전 조정
    seoulPinGroup.rotateX(-Math.PI / 2);

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

  // Piazza San Pietro에서 서울까지 지구 외곽을 따라 이어지는 선 추가 함수
  const addVaticanToSeoulLine = useCallback(() => {
    if (!arrowsRef.current) return;

    // 바티칸(Piazza San Pietro) 좌표
    const vaticanLat = 41.9022 * (Math.PI / 180);
    const vaticanLng = 12.4539 * (Math.PI / 180);
    
    // 서울 좌표
    const seoulLat = 37.5665 * (Math.PI / 180);
    const seoulLng = 126.9780 * (Math.PI / 180);

    // 지구 외곽을 따라가는 경로 생성
    const lineGeometry = new THREE.BufferGeometry();
    const points = [];
    const segments = 200; // 더 부드러운 곡선을 위해 세그먼트 수 증가

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      
      // 위도와 경도를 보간
      const lat = vaticanLat + (seoulLat - vaticanLat) * t;
      const lng = vaticanLng + (seoulLng - vaticanLng) * t;
      
      // 3D 좌표로 변환 - 핀 위치 계산식과 동일하게 (1.02배, 경도 음수 변환)
      const x = Math.cos(lat) * Math.cos(-lng) * 1.02;
      const y = Math.sin(lat) * 1.02;
      const z = Math.cos(lat) * Math.sin(-lng) * 1.02;
      
      points.push(x, y, z);
    }

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0xffffff, // 흰색
      linewidth: 2,
      transparent: true,
      opacity: 0.8
    });

    const line = new THREE.Line(lineGeometry, lineMaterial);
    arrowsRef.current.add(line);
  }, []);

  // 베이징에서 서울까지 지구 외곽을 따라 이어지는 선 추가 함수
  const addBeijingToSeoulLine = useCallback(() => {
    if (!arrowsRef.current) return;

    // 베이징 좌표
    const beijingLat = 39.9042 * (Math.PI / 180);
    const beijingLng = 116.4074 * (Math.PI / 180);
    
    // 서울 좌표
    const seoulLat = 37.5665 * (Math.PI / 180);
    const seoulLng = 126.9780 * (Math.PI / 180);

    // 지구 외곽을 따라가는 경로 생성
    const lineGeometry = new THREE.BufferGeometry();
    const points = [];
    const segments = 200; // 더 부드러운 곡선을 위해 세그먼트 수 증가

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      
      // 위도와 경도를 보간
      const lat = beijingLat + (seoulLat - beijingLat) * t;
      const lng = beijingLng + (seoulLng - beijingLng) * t;
      
      // 3D 좌표로 변환 - 핀 위치 계산식과 동일하게 (1.02배, 경도 음수 변환)
      const x = Math.cos(lat) * Math.cos(-lng) * 1.02;
      const y = Math.sin(lat) * 1.02;
      const z = Math.cos(lat) * Math.sin(-lng) * 1.02;
      
      points.push(x, y, z);
    }

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0xffffff, // 흰색
      linewidth: 2,
      transparent: true,
      opacity: 0.8
    });

    const line = new THREE.Line(lineGeometry, lineMaterial);
    arrowsRef.current.add(line);
  }, []);

  // 바티칸 핀 옆에 이미지와 텍스트 추가 함수 (3D 방식)
  const addVaticanImageAndText = useCallback(() => {
    console.log('바티칸 함수 호출됨');
    if (!sceneRef.current || !globeRef.current) {
      console.log('sceneRef 또는 globeRef가 없음');
      return;
    }

    // 바티칸 좌표
    const vaticanLat = 41.9022 * (Math.PI / 180);
    const vaticanLng = 12.4539 * (Math.PI / 180);
    
    console.log('바티칸 좌표 계산됨:', { lat: vaticanLat, lng: vaticanLng });
    
    // 바티칸 핀 위치 계산 (핀과 동일한 방식)
    const x = Math.cos(vaticanLat) * Math.cos(-vaticanLng) * 1.02;
    const y = Math.sin(vaticanLat) * 1.02;
    const z = Math.cos(vaticanLat) * Math.sin(-vaticanLng) * 1.02;
    
    console.log('바티칸 3D 위치 계산됨:', { x, y, z });

    // 이미지 텍스처 로드
    console.log('바티칸 이미지 로드 시작');
    const textureLoader = new THREE.TextureLoader();
    const vaticanTexture = textureLoader.load('/images/vatican.jpg', 
      () => console.log('바티칸 이미지 로드 성공'),
      undefined,
      (error) => console.error('바티칸 이미지 로드 실패:', error)
    );
    
    // 이미지 평면 생성 (비율 유지, 80% 크기)
    const imageGeometry = new THREE.PlaneGeometry(0.17, 0.24); // 원본 비율 357:500에 맞춤
    const imageMaterial = new THREE.MeshBasicMaterial({ 
      map: vaticanTexture, 
      transparent: true,
      side: THREE.DoubleSide  // 양면 모두 보이도록 수정
    });
    const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);
    
    // 이미지를 바티칸 핀 옆에 배치 - 지구에서 더 떨어뜨림
    imageMesh.position.set(x + 0.15, y + 0.25, z + 0.15);
    
    // 이미지를 항상 카메라를 향하도록 설정 (똑바르게 보이게)
    // 회전 제거하고 카메라를 향하도록 함
    
    // 이미지 ref에 저장
    vaticanImageRef.current = imageMesh;
    
    // '배송 완료' 텍스트 생성 (Canvas로 텍스트 텍스처 생성)
    const vaticanDeliveryCanvas = document.createElement('canvas');
    const vaticanDeliveryCtx = vaticanDeliveryCanvas.getContext('2d');
    vaticanDeliveryCanvas.width = 512;  // 가로 크기
    vaticanDeliveryCanvas.height = 128; // 세로 크기
    
    if (vaticanDeliveryCtx) {
      vaticanDeliveryCtx.fillStyle = '#F8D1E7';  // 핑크색 배경
      vaticanDeliveryCtx.fillRect(0, 0, vaticanDeliveryCanvas.width, vaticanDeliveryCanvas.height);
      vaticanDeliveryCtx.fillStyle = '#000000';  // 검정 텍스트
      vaticanDeliveryCtx.font = 'bold 48px Arial';
      vaticanDeliveryCtx.textAlign = 'center';
      vaticanDeliveryCtx.textBaseline = 'middle';
      vaticanDeliveryCtx.fillText('배송 완료', vaticanDeliveryCanvas.width / 2, vaticanDeliveryCanvas.height / 2);
    }
    
    const vaticanDeliveryTexture = new THREE.CanvasTexture(vaticanDeliveryCanvas);
    vaticanDeliveryTexture.minFilter = THREE.LinearFilter;
    vaticanDeliveryTexture.magFilter = THREE.LinearFilter;
    vaticanDeliveryTexture.generateMipmaps = false;
    const vaticanDeliveryGeometry = new THREE.PlaneGeometry(0.3, 0.08);
    const vaticanDeliveryMaterial = new THREE.MeshBasicMaterial({ 
      map: vaticanDeliveryTexture,
      transparent: true,
      side: THREE.DoubleSide
    });
    const vaticanDeliveryMesh = new THREE.Mesh(vaticanDeliveryGeometry, vaticanDeliveryMaterial);
    
    // '배송 완료' 텍스트를 바티칸 이미지 위에 배치
    vaticanDeliveryMesh.position.set(x + 0.15, y + 0.5, z + 0.15);
    
    // 바티칸 배송 완료 ref에 저장
    vaticanDeliveryRef.current = vaticanDeliveryMesh;
    
    // 통합된 텍스트 박스 생성 (Canvas로 텍스트 텍스처 생성)
    const textCanvas = document.createElement('canvas');
    const textCtx = textCanvas.getContext('2d');
    textCanvas.width = 512;  // 가로 크기
    textCanvas.height = 256; // 세로 크기 (두 줄 텍스트를 위한 충분한 높이)
    
    if (textCtx) {
      textCtx.fillStyle = '#000000';  // 검정 배경
      textCtx.fillRect(0, 0, textCanvas.width, textCanvas.height);
      textCtx.fillStyle = '#ffffff';  // 흰색 텍스트
      textCtx.font = 'bold 40px Arial';
      textCtx.textAlign = 'center';
      textCtx.textBaseline = 'middle';
      
      // 첫 번째 줄 텍스트
      textCtx.fillText('Artistic Gymnastic', textCanvas.width / 2, textCanvas.height / 3);
      // 두 번째 줄 텍스트
      textCtx.fillText('(70th aniversary of DPRK)', textCanvas.width / 2, (textCanvas.height / 3) * 2);
    }
    
    const textTexture = new THREE.CanvasTexture(textCanvas);
    textTexture.minFilter = THREE.LinearFilter;
    textTexture.magFilter = THREE.LinearFilter;
    textTexture.generateMipmaps = false;
    const textGeometry = new THREE.PlaneGeometry(0.4, 0.2); // 가로로 긴 직사각형
    const textMaterial = new THREE.MeshBasicMaterial({ 
      map: textTexture,
      transparent: true,
      side: THREE.DoubleSide
    });
    const textBackground = new THREE.Mesh(textGeometry, textMaterial);
    
    // 통합된 텍스트 박스를 이미지 아래에 배치
    textBackground.position.set(x + 0.15, y + 0.02, z + 0.15);
    
    // 텍스트 ref에 저장 (하나의 메시로 통합)
    vaticanText1Ref.current = textBackground;
    vaticanText2Ref.current = textBackground;
    
    // 이미지와 텍스트들을 지구본의 자식으로 추가하여 회전 동기화
    globeRef.current.add(imageMesh);
    globeRef.current.add(textBackground);
    globeRef.current.add(vaticanDeliveryMesh);
    
    // 바티칸과 베이징을 제외한 props에 대해 이미지와 텍스트 추가
    addAllPropsImagesAndText();
    
    // 바티칸과 베이징 이미지와 텍스트 추가 (직접 구현)
    console.log('바티칸과 베이징 직접 구현 시작');
    
    // 바티칸 이미지와 텍스트 직접 추가
    if (sceneRef.current && globeRef.current) {
      console.log('바티칸 추가 시작');
      
      // 바티칸 좌표
      const vaticanLat = 41.9022 * (Math.PI / 180);
      const vaticanLng = 12.4539 * (Math.PI / 180);
      
      // 바티칸 핀 위치 계산
      const x = Math.cos(vaticanLat) * Math.cos(-vaticanLng) * 1.02;
      const y = Math.sin(vaticanLat) * 1.02;
      const z = Math.cos(vaticanLat) * Math.sin(-vaticanLng) * 1.02;
      
      console.log('바티칸 위치:', { x, y, z });
      
      // 바티칸 이미지 로드
      const textureLoader = new THREE.TextureLoader();
      const vaticanTexture = textureLoader.load('/images/vatican.jpg', 
        () => {
          console.log('바티칸 이미지 로드 성공');
          
          // 바티칸 이미지 메시 생성
          const imageGeometry = new THREE.PlaneGeometry(0.17, 0.24);
          const imageMaterial = new THREE.MeshBasicMaterial({ 
            map: vaticanTexture, 
            transparent: true,
            side: THREE.DoubleSide
          });
          const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);
          imageMesh.position.set(x + 0.15, y + 0.25, z + 0.15);
          
          // 지구본에 추가
          if (globeRef.current) {
            globeRef.current.add(imageMesh);
            console.log('바티칸 이미지 추가 완료');
          }
        },
        undefined,
        (error) => console.error('바티칸 이미지 로드 실패:', error)
      );
    }
    
    // 베이징 이미지와 텍스트 직접 추가
    if (sceneRef.current && globeRef.current) {
      console.log('베이징 추가 시작');
      
      // 베이징 좌표
      const beijingLat = 39.9042 * (Math.PI / 180);
      const beijingLng = 116.4074 * (Math.PI / 180);
      
      // 베이징 핀 위치 계산
      const x = Math.cos(beijingLat) * Math.cos(-beijingLng) * 1.02;
      const y = Math.sin(beijingLat) * 1.02;
      const z = Math.cos(beijingLat) * Math.sin(-beijingLng) * 1.02;
      
      console.log('베이징 위치:', { x, y, z });
      
      // 베이징 이미지 로드
      const textureLoader = new THREE.TextureLoader();
      const beijingTexture = textureLoader.load('/images/beijing.png', 
        () => {
          console.log('베이징 이미지 로드 성공');
          
          // 베이징 이미지 메시 생성
          const imageGeometry = new THREE.PlaneGeometry(0.17, 0.24);
          const imageMaterial = new THREE.MeshBasicMaterial({ 
            map: beijingTexture, 
            transparent: true,
            side: THREE.DoubleSide
          });
          const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);
          imageMesh.position.set(x + 0.15, y + 0.6, z + 0.15);
          
          // 지구본에 추가
          if (globeRef.current) {
            globeRef.current.add(imageMesh);
            console.log('베이징 이미지 추가 완료');
          }
        },
        undefined,
        (error) => console.error('베이징 이미지 로드 실패:', error)
      );
    }
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
      // addPaymentArrow(payment); // 화살표 표시 비활성화
      
      // 결제 완료된 props의 "주문 완료" 텍스트 표시
      showOrderCompletedText(payment.fromCity.propName);
      
      // 해당 props의 핀부터 서울까지 흰색 점선 추가
      addDottedLineToSeoul(payment.fromCity);
    };

    window.addEventListener('payment-completed', handlePayment as EventListener);

    return () => {
      window.removeEventListener('payment-completed', handlePayment as EventListener);
    };
  }, [addPaymentArrow]);

  // 서울까지 흰색 점선 추가 함수
  const addDottedLineToSeoul = useCallback((fromCity: any) => {
    if (!arrowsRef.current) return;

    // 출발지와 도착지(서울) 좌표
    const fromLat = fromCity.lat;
    const fromLng = fromCity.lng;
    const toLat = 37.5665; // 서울 위도
    const toLng = 126.9780; // 서울 경도

    // 3D 좌표로 변환
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

    // 점선 생성
    const lineGeometry = new THREE.BufferGeometry();
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

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    // 흰색 점선 재질
    const lineMaterial = new THREE.LineDashedMaterial({ 
      color: 0xffffff, 
      linewidth: 2,
      dashSize: 0.1,
      gapSize: 0.05,
      transparent: true,
      opacity: 0.8
    });

    const dottedLine = new THREE.Line(lineGeometry, lineMaterial);
    dottedLine.computeLineDistances(); // 점선 효과를 위해 필요
    dottedLine.userData = { payment: fromCity, createdAt: Date.now() };

    arrowsRef.current.add(dottedLine);

    // 점선은 제거하지 않고 계속 유지
  }, []);

  // "주문 완료" 텍스트 표시 함수
  const showOrderCompletedText = useCallback((propName: string) => {
    if (!globeRef.current) return;

    // props.json에서 해당 prop 찾기
    const prop = propsData.props.find(p => p.name === propName);
    if (!prop) return;

    // 해당 prop의 도시 찾기
    const city = cities.find(c => 
      c.city === prop.origin.city || 
      (c.city.includes(prop.origin.city) || prop.origin.city.includes(c.city))
    );

    if (!city) return;

    // 도시 좌표 계산
    const x = Math.cos(city.lat * (Math.PI / 180)) * Math.cos(-city.lng * (Math.PI / 180)) * 1.02;
    const y = Math.sin(city.lat * (Math.PI / 180)) * 1.02;
    const z = Math.cos(city.lat * (Math.PI / 180)) * Math.sin(-city.lng * (Math.PI / 180)) * 1.02;

    // "주문 완료" 텍스트 생성 (Canvas로 텍스트 텍스처 생성)
    const orderCompletedCanvas = document.createElement('canvas');
    const orderCompletedCtx = orderCompletedCanvas.getContext('2d');
    orderCompletedCanvas.width = 512;
    orderCompletedCanvas.height = 128;
    
    if (orderCompletedCtx) {
      orderCompletedCtx.fillStyle = '#F8D1E7';  // 핑크색 배경
      orderCompletedCtx.fillRect(0, 0, orderCompletedCanvas.width, orderCompletedCanvas.height);
      orderCompletedCtx.fillStyle = '#000000';  // 검정 텍스트
      orderCompletedCtx.font = 'bold 48px Arial';
      orderCompletedCtx.textAlign = 'center';
      orderCompletedCtx.textBaseline = 'middle';
      orderCompletedCtx.fillText('주문 완료', orderCompletedCanvas.width / 2, orderCompletedCanvas.height / 2);
    }
    
    const orderCompletedTexture = new THREE.CanvasTexture(orderCompletedCanvas);
    orderCompletedTexture.minFilter = THREE.LinearFilter;
    orderCompletedTexture.magFilter = THREE.LinearFilter;
    orderCompletedTexture.generateMipmaps = false;
    
    const orderCompletedGeometry = new THREE.PlaneGeometry(0.3, 0.08);
    const orderCompletedMaterial = new THREE.MeshBasicMaterial({ 
      map: orderCompletedTexture,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    const orderCompletedMesh = new THREE.Mesh(orderCompletedGeometry, orderCompletedMaterial);
    
    // 이미지 위에 배치
    const baseOffset = 0.2;
    let regionOffsetX = 0;
    let regionOffsetY = 0;
    let regionOffsetZ = 0;
    
    // props ID와 지역을 기반으로 위치를 조정하여 겹치지 않도록 함
    if (prop.origin.country === 'Japan' && prop.origin.city === 'Kochi') {
      regionOffsetX = (prop.id % 4) * 0.09;
      regionOffsetY = Math.floor(prop.id / 4) * 0.11;
      regionOffsetZ = (prop.id % 3) * 0.09;
    } else if (prop.origin.country === 'China' && prop.origin.city === 'Liaoning') {
      regionOffsetX = (prop.id % 3) * 0.08;
      regionOffsetY = Math.floor(prop.id / 3) * 0.06;
      regionOffsetZ = (prop.id % 2) * 0.08;
    } else if (prop.origin.country === 'United States' && prop.origin.city === 'Charleston, South Carolina') {
      regionOffsetX = (prop.id % 2) * 0.09;
      regionOffsetY = Math.floor(prop.id / 2) * 0.11;
      regionOffsetZ = (prop.id % 2) * 0.09;
    } else {
      regionOffsetX = (prop.id % 3) * 0.06;
      regionOffsetY = (prop.id % 2) * 0.08;
      regionOffsetZ = (prop.id % 3) * 0.06;
    }
    
    const offsetX = baseOffset + regionOffsetX;
    const offsetY = baseOffset + regionOffsetY;
    const offsetZ = baseOffset + regionOffsetZ;
    
    // "주문 완료" 텍스트를 이미지 위에 배치
    orderCompletedMesh.position.set(x + offsetX, y + offsetY + 0.3, z + offsetZ);
    
    // 지구본에 추가
    globeRef.current.add(orderCompletedMesh);
    
    // 반짝거리는 애니메이션 효과
    const animateTwinkle = () => {
      const time = Date.now() * 0.005;
      const opacity = 0.5 + 0.5 * Math.sin(time * 3);
      const scale = 1 + 0.1 * Math.sin(time * 2);
      
      orderCompletedMaterial.opacity = opacity;
      orderCompletedMesh.scale.setScalar(scale);
      
      // 애니메이션 계속 실행
      requestAnimationFrame(animateTwinkle);
    };
    
    animateTwinkle();
    
    // "주문 완료" 텍스트는 제거하지 않고 계속 유지
  }, [cities]);

  // 모든 props에 대해 이미지와 텍스트 추가하는 함수
  const addAllPropsImagesAndText = useCallback(() => {
    if (!globeRef.current) return;

    propsData.props.forEach((prop) => {
      // props.json의 origin 정보를 기반으로 도시 찾기
      const city = cities.find(c => 
        c.city === prop.origin.city || 
        (c.city.includes(prop.origin.city) || prop.origin.city.includes(c.city))
      );

      if (!city) return; // 매칭되는 도시가 없으면 건너뛰기

      // 도시 좌표
      const x = Math.cos(city.lat * (Math.PI / 180)) * Math.cos(-city.lng * (Math.PI / 180)) * 1.02;
      const y = Math.sin(city.lat * (Math.PI / 180)) * 1.02;
      const z = Math.cos(city.lat * (Math.PI / 180)) * Math.sin(-city.lng * (Math.PI / 180)) * 1.02;

      // 이미지 텍스처 로드
      const textureLoader = new THREE.TextureLoader();
      const imageTexture = textureLoader.load(prop.image);
      
      // 이미지 평면 생성 (원본 비율 유지)
      const imageGeometry = new THREE.PlaneGeometry(0.17, 0.24);
      const imageMaterial = new THREE.MeshBasicMaterial({ 
        map: imageTexture, 
        transparent: true,
        side: THREE.DoubleSide
      });
      const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);
      
      // 모든 props를 지구에서 동일한 거리에 배치
      const baseOffset = 0.2; // 모든 props의 기본 거리
      
      // 같은 지역의 props들을 겹치지 않도록 위치 조정
      let regionOffsetX = 0;
      let regionOffsetY = 0;
      let regionOffsetZ = 0;
      
              // props ID와 지역을 기반으로 위치를 조정하여 겹치지 않도록 함
    if (prop.origin.country === 'Japan' && prop.origin.city === 'Kochi') {
      // 일본 Kochi의 props들을 미국과 동일한 간격으로 분산
      regionOffsetX = (prop.id % 4) * 0.09; // 0, 0.09, 0.18, 0.27 (미국과 동일한 X축 간격)
      regionOffsetY = Math.floor(prop.id / 4) * 0.11; // 0, 0.11, 0.22, 0.33 (미국과 동일한 Y축 간격)
      regionOffsetZ = (prop.id % 3) * 0.09; // 0, 0.09, 0.18, 0.27 (미국과 동일한 Z축 간격)
    } else if (prop.origin.country === 'China' && prop.origin.city === 'Liaoning') {
      // 중국 Liaoning의 props들을 간단하게 분산
      regionOffsetX = (prop.id % 3) * 0.08; // 0, 0.08, 0.16
      regionOffsetY = Math.floor(prop.id / 3) * 0.06; // 0, 0.06, 0.12
      regionOffsetZ = (prop.id % 2) * 0.08; // 0, 0.08
    } else if (prop.origin.country === 'United States' && prop.origin.city === 'Charleston, South Carolina') {
      // 미국 Charleston의 props들을 ID 기반으로 분산
      regionOffsetX = (prop.id % 2) * 0.09; // 0, 0.09
      regionOffsetY = Math.floor(prop.id / 2) * 0.11; // 0, 0.11
      regionOffsetZ = (prop.id % 2) * 0.09; // 0, 0.09
    } else {
      // 기타 지역은 기존 방식으로
      regionOffsetX = (prop.id % 3) * 0.06;
      regionOffsetY = (prop.id % 2) * 0.08;
      regionOffsetZ = (prop.id % 3) * 0.06;
    }
      
      const offsetX = baseOffset + regionOffsetX;
      const offsetY = baseOffset + regionOffsetY;
      const offsetZ = baseOffset + regionOffsetZ;
      
      // 이미지를 핀 옆에 배치 (지구본에서 더 멀리, 겹치지 않도록)
      imageMesh.position.set(x + offsetX, y + offsetY, z + offsetZ);
      
      // 텍스트 생성 (Canvas로 텍스트 텍스처 생성)
      const textCanvas = document.createElement('canvas');
      const textCtx = textCanvas.getContext('2d');
      
      if (textCtx) {
        textCtx.font = 'bold 40px Arial';
        textCtx.textAlign = 'center';
        textCtx.textBaseline = 'middle';
        
        // 상품명을 여러 줄로 나누기 (긴 텍스트 처리)
        const words = prop.name.split(' ');
        const lines = [];
        let currentLine = '';
        
        words.forEach(word => {
          if ((currentLine + ' ' + word).length > 25) {
            lines.push(currentLine.trim());
            currentLine = word;
          } else {
            currentLine += (currentLine ? ' ' : '') + word;
          }
        });
        if (currentLine) lines.push(currentLine.trim());
        
        // 최대 3줄까지만 표시
        const displayLines = lines.slice(0, 3);
        
        // 텍스트 길이에 따라 Canvas 크기 동적 조정
        const maxLineLength = Math.max(...displayLines.map(line => textCtx.measureText(line).width));
        const canvasWidth = Math.max(512, maxLineLength + 40); // 텍스트 길이 + 여백
        const canvasHeight = displayLines.length === 1 ? 128 : 256; // 한 줄이면 높이 줄임
        
        textCanvas.width = canvasWidth;
        textCanvas.height = canvasHeight;
        
        // Canvas 크기가 변경되었으므로 컨텍스트 재설정
        textCtx.font = 'bold 40px Arial';
        textCtx.textAlign = 'center';
        textCtx.textBaseline = 'middle';
        
        // 배경 그리기
        textCtx.fillStyle = '#000000';  // 검정 배경
        textCtx.fillRect(0, 0, textCanvas.width, textCanvas.height);
        textCtx.fillStyle = '#ffffff';  // 흰색 텍스트
        
        // 텍스트 그리기
        const lineHeight = textCanvas.height / (displayLines.length + 1);
        displayLines.forEach((line, index) => {
          textCtx.fillText(line, textCanvas.width / 2, lineHeight * (index + 1));
        });
      }
      
      const textTexture = new THREE.CanvasTexture(textCanvas);
      textTexture.minFilter = THREE.LinearFilter;
      textTexture.magFilter = THREE.LinearFilter;
      textTexture.generateMipmaps = false;
      
      // 텍스트 길이에 따라 Geometry 크기 동적 조정
      const textWidth = textCanvas.width / 512 * 0.4; // Canvas 크기에 비례하여 조정
      const textHeight = textCanvas.height === 128 ? 0.1 : 0.2; // 한 줄이면 높이 줄임
      
      const textGeometry = new THREE.PlaneGeometry(textWidth, textHeight);
      const textMaterial = new THREE.MeshBasicMaterial({ 
        map: textTexture,
        transparent: true,
        side: THREE.DoubleSide
      });
      const textBackground = new THREE.Mesh(textGeometry, textMaterial);
      
      // 텍스트를 이미지 아래에 배치 (더 멀리, 겹치지 않도록)
      textBackground.position.set(x + offsetX, y + offsetY - 0.25, z + offsetZ);
      
      // 지구본의 자식으로 추가하여 회전 동기화
      if (globeRef.current) {
        globeRef.current.add(imageMesh);
        globeRef.current.add(textBackground);
      }
    });
  }, [cities]);

  // 베이징 이미지와 텍스트 추가 함수
  const addBeijingImageAndText = useCallback(() => {
    console.log('베이징 함수 호출됨');
    if (!sceneRef.current || !globeRef.current) {
      console.log('sceneRef 또는 globeRef가 없음');
      return;
    }

    // 베이징 좌표
    const beijingLat = 39.9042 * (Math.PI / 180);
    const beijingLng = 116.4074 * (Math.PI / 180);
    
    // 베이징 핀 위치 계산 (핀과 동일한 방식)
    const x = Math.cos(beijingLat) * Math.cos(-beijingLng) * 1.02;
    const y = Math.sin(beijingLat) * 1.02;
    const z = Math.cos(beijingLat) * Math.sin(-beijingLng) * 1.02;

    // 베이징 이미지 텍스처 로드
    const textureLoader = new THREE.TextureLoader();
    const beijingTexture = textureLoader.load('/images/beijing.png');
    
    // 베이징 이미지 평면 생성 (비율 유지, 80% 크기)
    const beijingImageGeometry = new THREE.PlaneGeometry(0.17, 0.24); // 원본 비율 666:970에 맞춤
    const beijingImageMaterial = new THREE.MeshBasicMaterial({ 
      map: beijingTexture, 
      transparent: true,
      side: THREE.DoubleSide
    });
    const beijingImageMesh = new THREE.Mesh(beijingImageGeometry, beijingImageMaterial);
    
    // 베이징 이미지를 베이징 핀 옆에 배치 - 지구에서 훨씬 많이 떨어뜨림
    beijingImageMesh.position.set(x + 0.15, y + 0.6, z + 0.15);
    
    // 베이징 이미지를 항상 카메라를 향하도록 설정 (똑바르게 보이게)
    // 회전 제거하고 카메라를 향하도록 함
    
    // 베이징 이미지 ref에 저장
    beijingImageRef.current = beijingImageMesh;
    
    // '배송 완료' 텍스트 생성 (Canvas로 텍스트 텍스처 생성)
    const beijingDeliveryCanvas = document.createElement('canvas');
    const beijingDeliveryCtx = beijingDeliveryCanvas.getContext('2d');
    beijingDeliveryCanvas.width = 512;  // 가로 크기
    beijingDeliveryCanvas.height = 128; // 세로 크기
    
    if (beijingDeliveryCtx) {
      beijingDeliveryCtx.fillStyle = '#F8D1E7';  // 핑크색 배경
      beijingDeliveryCtx.fillRect(0, 0, beijingDeliveryCanvas.width, beijingDeliveryCanvas.height);
      beijingDeliveryCtx.fillStyle = '#000000';  // 검정 텍스트
      beijingDeliveryCtx.font = 'bold 48px Arial';
      beijingDeliveryCtx.textAlign = 'center';
      beijingDeliveryCtx.textBaseline = 'middle';
      beijingDeliveryCtx.fillText('배송 완료', beijingDeliveryCanvas.width / 2, beijingDeliveryCanvas.height / 2);
    }
    
    const beijingDeliveryTexture = new THREE.CanvasTexture(beijingDeliveryCanvas);
    beijingDeliveryTexture.minFilter = THREE.LinearFilter;
    beijingDeliveryTexture.magFilter = THREE.LinearFilter;
    beijingDeliveryTexture.generateMipmaps = false;
    const beijingDeliveryGeometry = new THREE.PlaneGeometry(0.3, 0.08);
    const beijingDeliveryMaterial = new THREE.MeshBasicMaterial({ 
      map: beijingDeliveryTexture,
      transparent: true,
      side: THREE.DoubleSide
    });
    const beijingDeliveryMesh = new THREE.Mesh(beijingDeliveryGeometry, beijingDeliveryMaterial);
    
    // '배송 완료' 텍스트를 베이징 이미지 위에 배치
    beijingDeliveryMesh.position.set(x + 0.15, y + 0.8, z + 0.15);
    
    // 베이징 배송 완료 ref에 저장
    beijingDeliveryRef.current = beijingDeliveryMesh;
    
    // 통합된 텍스트 박스 생성 (Canvas로 텍스트 텍스처 생성)
    const beijingTextCanvas = document.createElement('canvas');
    const beijingTextCtx = beijingTextCanvas.getContext('2d');
    beijingTextCanvas.width = 512;  // 가로 크기
    beijingTextCanvas.height = 128; // 세로 크기 (한 줄 텍스트에 맞춤)
    
    if (beijingTextCtx) {
      beijingTextCtx.fillStyle = '#000000';  // 검정 배경
      beijingTextCtx.fillRect(0, 0, beijingTextCanvas.width, beijingTextCanvas.height);
      beijingTextCtx.fillStyle = '#ffffff';  // 흰색 텍스트
      beijingTextCtx.font = 'bold 40px Arial';
      beijingTextCtx.textAlign = 'center';
      beijingTextCtx.textBaseline = 'middle';
      
      // 첫 번째 줄 텍스트만 (중앙에 배치)
      beijingTextCtx.fillText('𝘼𝙧𝙘𝙝 𝙤𝙛 𝙏𝙧𝙞𝙪𝙢𝙥𝙝', beijingTextCanvas.width / 2, beijingTextCanvas.height / 2);
    }
    
    const beijingTextTexture = new THREE.CanvasTexture(beijingTextCanvas);
    beijingTextTexture.minFilter = THREE.LinearFilter;
    beijingTextTexture.magFilter = THREE.LinearFilter;
    beijingTextTexture.generateMipmaps = false;
    const beijingTextGeometry = new THREE.PlaneGeometry(0.4, 0.1); // 가로로 긴 직사각형 (한 줄 텍스트에 맞춤)
    const beijingTextMaterial = new THREE.MeshBasicMaterial({ 
      map: beijingTextTexture,
      transparent: true,
      side: THREE.DoubleSide
    });
    const beijingTextBackground = new THREE.Mesh(beijingTextGeometry, beijingTextMaterial);
    
    // 통합된 텍스트 박스를 베이징 이미지 아래에 배치
    beijingTextBackground.position.set(x + 0.15, y + 0.35, z + 0.15);
    
    // 베이징 텍스트 ref에 저장 (하나의 메시로 통합)
    beijingText1Ref.current = beijingTextBackground;
    beijingText2Ref.current = beijingTextBackground;
    
    // 베이징 이미지와 텍스트들을 지구본의 자식으로 추가하여 회전 동기화
    globeRef.current.add(beijingImageMesh);
    globeRef.current.add(beijingTextBackground);
    globeRef.current.add(beijingDeliveryMesh);
  }, []);

  // 결제 모니터링 서비스 시작
  useEffect(() => {
    console.log('🚀 GlobeViewer 결제 모니터링 서비스 시작...');
    paymentPollingServiceRef.current = new GlobePaymentMonitorService();
    paymentPollingServiceRef.current.startPolling({
      onNewPayment: handleNewPayment
    });

    return () => {
      console.log('🛑 GlobeViewer 결제 모니터링 서비스 중지...');
      if (paymentPollingServiceRef.current) {
        paymentPollingServiceRef.current.stopPolling();
      }
    };
  }, [handleNewPayment]);

  // WebSocket 연결 상태 시뮬레이션
  useEffect(() => {
    const timer = setTimeout(() => {
      onConnectionChange(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onConnectionChange]);

  // 모달 닫기 함수
  const handleCloseModal = useCallback(() => {
    setOrderModalVisible(false);
    setCurrentOrderInfo(null);
  }, []);

  return (
    <>
      {/* 3D 지구본 컨테이너 */}
      <div 
        ref={mountRef} 
        className="w-full h-full"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vh',
          height: '100vw',
          zIndex: 0
        }}
      />
      
      {/* 배송 완료 목록 오버레이 */}
      <div 
        className="fixed top-16 left-16 z-50 text-white"
        style={{
          maxWidth: '800px',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        <h3 className="text-4xl font-bold text-pink-400 mb-6">배송 완료 목록</h3>
        <div className="space-y-4 text-xl">
          <div className="flex items-start">
            <span className="text-pink-300 font-bold mr-4 text-2xl">1)</span>
            <div>
              <div className="text-2xl">Artistic Gymnastic (70th aniversary of DPRK)</div>
              <div className="text-gray-300 text-lg">출발지: 로마, 이탈리아</div>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-pink-300 font-bold mr-4 text-2xl">2)</span>
            <div>
              <div className="text-2xl">Arch of Triumph, Pyongyang</div>
              <div className="text-gray-300 text-lg">출발지: 베이징, 중국</div>
            </div>
          </div>
        </div>
      </div>

      {/* 주문 완료 모달 */}
      <OrderCompleteModal
        isVisible={orderModalVisible}
        orderInfo={currentOrderInfo}
        onClose={handleCloseModal}
      />
    </>
  );
}
