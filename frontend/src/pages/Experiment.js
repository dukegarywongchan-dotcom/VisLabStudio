import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';

// Drag Handler Component
function DragHandler({ isDragging, selectedItem, onPositionUpdate, glasswarePositions }) {
  const { camera, gl } = useThree();

  useEffect(() => {
    if (!isDragging || !selectedItem) return;

    const raycaster = new THREE.Raycaster();

    const handleMouseMove = (event) => {
      if (event.buttons !== 1) return;
      if (!selectedItem) return;

      const rect = gl.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      raycaster.setFromCamera(mouse, camera);
      const currentY = glasswarePositions[selectedItem][1];
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -currentY);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);

      if (intersection) {
        onPositionUpdate(selectedItem, [intersection.x, currentY, intersection.z]);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        // If mouse is released anywhere, stop dragging
        onPositionUpdate(selectedItem, glasswarePositions[selectedItem]);
      }
    };

    gl.domElement.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('mouseup', handleMouseUp);

    return () => {
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, selectedItem, camera, gl, onPositionUpdate, glasswarePositions]);

  return null;
}

const tapPosition = [4.5, 0.95, 0];

// Interactive Beaker with drag functionality and water levels
function InteractiveBeaker({ id, initialPosition, color = '#E8F4F8', onSelect, isSelected, isHeating, isCooling, isPouring, onDragStart, onDragEnd, onPositionUpdate, waterLevel = 0.5 }) {
  const groupRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <group 
      ref={groupRef} 
      position={initialPosition}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      onPointerDown={(e) => {
        if (isSelected) {
          e.stopPropagation();
          setIsDragging(true);
          onDragStart(id);
        }
      }}
      onPointerUp={(e) => {
        if (isDragging) {
          e.stopPropagation();
          setIsDragging(false);
          onDragEnd(id);
        }
      }}
    >
      {/* Beaker body */}
      <mesh>
        <cylinderGeometry args={[0.35, 0.38, 0.75, 32]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.6}
          roughness={0.1}
          metalness={0.1}
          emissive={isHeating ? '#FF4500' : isCooling ? '#00BFFF' : '#000000'}
          emissiveIntensity={isHeating || isCooling ? 0.3 : 0}
        />
      </mesh>

      {/* Water level */}
      {waterLevel > 0 && (
        <mesh position={[0, -0.375 + (waterLevel * 0.75 * 0.5), 0]}>
          <cylinderGeometry args={[0.32, 0.32, waterLevel * 0.75, 32]} />
          <meshStandardMaterial 
            color="#4169E1" 
            transparent 
            opacity={0.8}
            emissive="#4169E1"
            emissiveIntensity={0.1}
          />
        </mesh>
      )}

      {/* Beaker rim */}
      <mesh position={[0, 0.4, 0]}>
        <torusGeometry args={[0.38, 0.08, 16, 32]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Temperature effects */}
      {(isHeating || isCooling) && (
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial 
            color={isHeating ? '#FF6347' : '#87CEEB'}
            emissive={isHeating ? '#FF4500' : '#00BFFF'}
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}

      {/* Pouring effect */}
      {isPouring && (
        <group position={[0.5, 0.3, 0]}>
          {/* Liquid stream */}
          <mesh rotation={[0, 0, -Math.PI/4]}>
            <coneGeometry args={[0.05, 0.3, 8]} />
            <meshStandardMaterial 
              color="#4169E1" 
              transparent 
              opacity={0.7}
              emissive="#4169E1"
              emissiveIntensity={0.2}
            />
          </mesh>
          {/* Droplets */}
          {[...Array(3)].map((_, i) => (
            <mesh key={i} position={[0.2 + i * 0.1, -0.1 - i * 0.05, 0]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial 
                color="#4169E1" 
                transparent 
                opacity={0.8}
                emissive="#4169E1"
                emissiveIntensity={0.3}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Selection highlight */}
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.8, 32]} />
          <meshStandardMaterial 
            color="#FFD700" 
            wireframe 
            opacity={0.8}
            transparent
          />
        </mesh>
      )}

      {/* Drag indicator */}
      {isDragging && (
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial 
            color="#00FF00" 
            emissive="#00FF00"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}

      {/* Hover tooltip */}
      {isHovered && (
        <Html position={[0, 0.6, 0]}>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            color: '#FFFFFF',
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            border: '1px solid #CCCCCC'
          }}>
            Beaker {id} - ISO 384 Standard | R: Raise | F: Lower | E: Pour | C: Cool | H: Heat
            <div>Water Level: {Math.round(waterLevel * 100)}%</div>
            {isHeating && <div style={{color: '#FF6347'}}>🔥 Heating</div>}
            {isCooling && <div style={{color: '#00BFFF'}}>❄️ Cooling</div>}
            {isPouring && <div style={{color: '#4169E1'}}>💧 Pouring</div>}
            {isDragging && <div style={{color: '#00FF00'}}>🖱️ Dragging</div>}
          </div>
        </Html>
      )}
    </group>
  );
}

// Interactive Flask with drag functionality and water levels
function InteractiveFlask({ id, initialPosition, color = '#FFE4B5', onSelect, isSelected, isHeating, isCooling, isPouring, onDragStart, onDragEnd, onPositionUpdate, waterLevel = 0.3, isUncapped = false }) {
  const groupRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <group 
      ref={groupRef} 
      position={initialPosition}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      onPointerDown={(e) => {
        if (isSelected) {
          e.stopPropagation();
          setIsDragging(true);
          onDragStart(id);
        }
      }}
      onPointerUp={(e) => {
        if (isDragging) {
          e.stopPropagation();
          setIsDragging(false);
          onDragEnd(id);
        }
      }}
    >
      {/* Flask body */}
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.65}
          roughness={0.1}
          metalness={0.05}
          emissive={isHeating ? '#FF4500' : isCooling ? '#00BFFF' : '#000000'}
          emissiveIntensity={isHeating || isCooling ? 0.3 : 0}
        />
      </mesh>

      {/* Water level */}
      {waterLevel > 0 && (
        <mesh position={[0, -0.15 + (waterLevel * 0.45 + 0.02) / 2, 0]}>
          <cylinderGeometry args={[0.22, 0.22, waterLevel * 0.45 + 0.02, 32]} />
          <meshStandardMaterial 
            color="#5EC8FF" 
            transparent 
            opacity={0.65}
            emissive="#56B8FF"
            emissiveIntensity={0.08}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Flask neck */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 0.4, 24]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.65}
          roughness={0.1}
        />
      </mesh>

      {/* Cap/Stopper */}
      {!isUncapped ? (
        <mesh position={[0, 0.8, 0]}>
          <coneGeometry args={[0.12, 0.15, 16]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      ) : (
        <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.14, 0.02, 16, 24]} />
          <meshStandardMaterial color="#888888" metalness={0.4} roughness={0.3} />
        </mesh>
      )}

      {/* Temperature effects */}
      {(isHeating || isCooling) && (
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial 
            color={isHeating ? '#FF6347' : '#87CEEB'}
            emissive={isHeating ? '#FF4500' : '#00BFFF'}
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}

      {/* Pouring effect */}
      {isPouring && (
        <group position={[0.4, 0.4, 0]}>
          {/* Liquid stream */}
          <mesh rotation={[0, 0, -Math.PI/6]}>
            <coneGeometry args={[0.04, 0.25, 8]} />
            <meshStandardMaterial 
              color="#DC143C" 
              transparent 
              opacity={0.7}
              emissive="#DC143C"
              emissiveIntensity={0.2}
            />
          </mesh>
          {/* Droplets */}
          {[...Array(3)].map((_, i) => (
            <mesh key={i} position={[0.15 + i * 0.08, -0.08 - i * 0.04, 0]}>
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshStandardMaterial 
                color="#DC143C" 
                transparent 
                opacity={0.8}
                emissive="#DC143C"
                emissiveIntensity={0.3}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Selection highlight */}
      {isSelected && (
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.38, 32, 32]} />
          <meshStandardMaterial 
            color="#00FF00" 
            wireframe 
            opacity={0.8}
            transparent
          />
        </mesh>
      )}

      {/* Drag indicator */}
      {isDragging && (
        <mesh position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial 
            color="#00FF00" 
            emissive="#00FF00"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}

      {/* Hover tooltip */}
      {isHovered && (
        <Html position={[0, 0.9, 0]}>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            color: '#FFFFFF',
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            border: '1px solid #CCCCCC'
          }}>
            Erlenmeyer Flask {id} - ISO 1773 Standard | R: Raise | F: Lower | E: Pour | C: Cool | H: Heat
            <div>Water Level: {Math.round(waterLevel * 100)}%</div>
            {isHeating && <div style={{color: '#FF6347'}}>🔥 Heating</div>}
            {isCooling && <div style={{color: '#00BFFF'}}>❄️ Cooling</div>}
            {isPouring && <div style={{color: '#DC143C'}}>💧 Pouring</div>}
            {isDragging && <div style={{color: '#00FF00'}}>🖱️ Dragging</div>}
          </div>
        </Html>
      )}
    </group>
  );
}

// Modern Lab Bench
function ModernLabBench() {
  return (
    <group>
      {/* Main counter top */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[12, 0.08, 5]} />
        <meshStandardMaterial 
          color="#E8E8E8" 
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Bench legs */}
      {[[-5.5, -1.2, 2], [5.5, -1.2, 2], [-5.5, -1.2, -2], [5.5, -1.2, -2]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.3, 1.2, 0.3]} />
          <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}

      {/* Storage shelf */}
      <mesh position={[0, -1.8, 0]}>
        <boxGeometry args={[12, 0.06, 5]} />
        <meshStandardMaterial color="#F5F5F5" metalness={0.7} />
      </mesh>

      {/* Safety hood back panel */}
      <mesh position={[6, 1.5, 0]}>
        <boxGeometry args={[0.15, 3, 5]} />
        <meshStandardMaterial color="#CCCCCC" metalness={0.4} />
      </mesh>

      {/* Fume hood frame */}
      <mesh position={[6.5, 1.2, 0]} scale={[0.08, 1.2, 1]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
      </mesh>

      {/* Safety eyewash station marker */}
      <mesh position={[-6, 0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 1.5, 16]} />
        <meshStandardMaterial color="#FFD700" metalness={0.6} />
      </mesh>
    </group>
  );
}

// Lab Walls
function Tap({ position, tapOn }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 16]} />
        <meshStandardMaterial color="#B0BEC5" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.25, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.6, 0.08, 0.08]} />
        <meshStandardMaterial color="#546E7A" />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <torusGeometry args={[0.18, 0.04, 16, 24]} />
        <meshStandardMaterial color="#78909C" />
      </mesh>
      {tapOn && (
        <group position={[0.25, 0.25, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.4, 12]} />
            <meshStandardMaterial color="#B3E5FC" transparent opacity={0.75} />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.04, 0.02, 0.08, 12]} />
            <meshStandardMaterial color="#81D4FA" transparent opacity={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function LabWalls() {
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 1.5, -3]}>
        <boxGeometry args={[12, 4, 0.2]} />
        <meshStandardMaterial color="#F0F0F0" />
      </mesh>
      {/* Left wall */}
      <mesh position={[-7, 1.5, 0]}>
        <boxGeometry args={[0.2, 4, 8]} />
        <meshStandardMaterial color="#F5F5F5" />
      </mesh>
    </group>
  );
}

// HUD Instructions
function LabHUD({ selectedItem, currentAction, glasswareStates, waterLevels, tapOn, uncappedState }) {
  const getSelectedItemState = () => {
    if (!selectedItem) return null;
    return glasswareStates[selectedItem];
  };

  const selectedState = getSelectedItemState();

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      background: 'rgba(0,0,0,0.7)',
      color: '#00FF00',
      padding: '15px',
      borderRadius: '5px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 100,
      border: '2px solid #00FF00'
    }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#FFD700' }}>
        INTERNATIONAL LAB SIMULATOR
      </div>
      <div style={{ marginBottom: '8px' }}>━━━━━━━━━━━━━━━━━━━</div>
      <div>① <strong>Hover</strong> - Show apparatus name & water level</div>
      <div>② <strong>Click</strong> - Select glassware</div>
      <div>③ <strong>Left Drag</strong> - Move selected glassware smoothly</div>
      <div>④ <strong>WASD</strong> - Move X/Z axis</div>
      <div>⑤ <strong>R/F</strong> - Adjust height (Y) with animation</div>
      <div>⑥ <strong>Scroll</strong> - Fine height adjust</div>
      <div>⑦ <strong>E</strong> - Pour between containers or dispense</div>
      <div>⑧ <strong>U</strong> - Uncap / cap selected flask</div>
      <div>⑨ <strong>T</strong> - Toggle DI tap / fill water</div>
      <div>⑩ <strong>C</strong> - Cool down</div>
      <div>⑪ <strong>H</strong> - Heat/Boil</div>
      <div>⑫ <strong>Mouse</strong> - Rotate view</div>
      <div style={{ marginTop: '8px', marginBottom: '8px' }}>━━━━━━━━━━━━━━━━━━━</div>
      <div style={{ color: '#FFD700' }}>ISO Standards Compliant</div>
      {selectedItem && (
        <div style={{ marginTop: '8px', color: '#00FF00' }}>
          Selected: <strong>{selectedItem}</strong>
          <div>Water Level: <strong>{Math.round(waterLevels[selectedItem] * 100)}%</strong></div>
          {selectedItem.startsWith('F') && (
            <div>{uncappedState[selectedItem] ? 'Flask uncapped' : 'Flask capped'}</div>
          )}
        </div>
      )}
      {currentAction && (
        <div style={{ marginTop: '4px', color: '#FFD700' }}>
          Action: <strong>{currentAction}</strong>
        </div>
      )}
      {selectedState && (selectedState.heating || selectedState.cooling || selectedState.pouring) && (
        <div style={{ marginTop: '4px', color: '#FFFF00' }}>
          Visual Effects:
          {selectedState.heating && <div>🔥 Heating (Red Glow)</div>}
          {selectedState.cooling && <div>❄️ Cooling (Blue Glow)</div>}
          {selectedState.pouring && <div>💧 Pouring (Liquid Stream)</div>}
        </div>
      )}
    </div>
  );
}

// Main Scene
function LabSceneContent({ selectedItem, onSelectItem, glasswarePositions, glasswareStates, onUpdatePosition, onDragStart, onDragEnd, onPositionUpdate, isDragging, waterLevels, tapOn, uncappedState }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[8, 5, 8]} intensity={1} />
      <pointLight position={[-8, 4, -8]} intensity={0.6} color="#87CEEB" />
      <directionalLight position={[4, 6, 4]} intensity={0.8} />

      {/* Environment */}
      <fog attach="fog" args={['#e8e8e8', 10, 40]} />

      {/* Drag Handler */}
      <DragHandler 
        isDragging={isDragging} 
        selectedItem={selectedItem} 
        onPositionUpdate={onPositionUpdate}
        glasswarePositions={glasswarePositions}
      />

      {/* Lab Infrastructure */}
      <LabWalls />
      <ModernLabBench />
      <Tap position={tapPosition} tapOn={tapOn} />
      
      {/* Interactive Equipment */}
      <InteractiveBeaker 
        id="B1" 
        initialPosition={glasswarePositions.B1} 
        color="#E8F4F8" 
        onSelect={onSelectItem}
        isSelected={selectedItem === 'B1'}
        isHeating={glasswareStates.B1.heating}
        isCooling={glasswareStates.B1.cooling}
        isPouring={glasswareStates.B1.pouring}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onPositionUpdate={onPositionUpdate}
        waterLevel={waterLevels.B1}
      />
      <InteractiveBeaker 
        id="B2" 
        initialPosition={glasswarePositions.B2} 
        color="#FFE4E1" 
        onSelect={onSelectItem}
        isSelected={selectedItem === 'B2'}
        isHeating={glasswareStates.B2.heating}
        isCooling={glasswareStates.B2.cooling}
        isPouring={glasswareStates.B2.pouring}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onPositionUpdate={onPositionUpdate}
        waterLevel={waterLevels.B2}
      />
      <InteractiveBeaker 
        id="B3" 
        initialPosition={glasswarePositions.B3} 
        color="#F0FFFF" 
        onSelect={onSelectItem}
        isSelected={selectedItem === 'B3'}
        isHeating={glasswareStates.B3.heating}
        isCooling={glasswareStates.B3.cooling}
        isPouring={glasswareStates.B3.pouring}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onPositionUpdate={onPositionUpdate}
        waterLevel={waterLevels.B3}
      />
      
      <InteractiveFlask 
        id="F1" 
        initialPosition={glasswarePositions.F1} 
        color="#FFFACD" 
        onSelect={onSelectItem}
        isSelected={selectedItem === 'F1'}
        isHeating={glasswareStates.F1.heating}
        isCooling={glasswareStates.F1.cooling}
        isPouring={glasswareStates.F1.pouring}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onPositionUpdate={onPositionUpdate}
        waterLevel={waterLevels.F1}
        isUncapped={uncappedState.F1}
      />
      <InteractiveFlask 
        id="F2" 
        initialPosition={glasswarePositions.F2} 
        color="#FFB6C1" 
        onSelect={onSelectItem}
        isSelected={selectedItem === 'F2'}
        isHeating={glasswareStates.F2.heating}
        isCooling={glasswareStates.F2.cooling}
        isPouring={glasswareStates.F2.pouring}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onPositionUpdate={onPositionUpdate}
        waterLevel={waterLevels.F2}
        isUncapped={uncappedState.F2}
      />

      {/* Grid reference */}
      <Grid 
        args={[12, 12]} 
        cellSize={0.5} 
        cellColor="#d0d0d0" 
        sectionSize={2} 
        sectionColor="#909090" 
        fadeDistance={25} 
        fadeStrength={1} 
        infiniteGrid 
      />

      {/* Controls */}
      <OrbitControls 
        enableZoom={true}
        enableRotate={!isDragging}
        autoRotate={false}
        minDistance={5}
        maxDistance={30}
      />
    </>
  );
}

// Main Experiment Component
function Experiment() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [glasswareStates, setGlasswareStates] = useState({
    B1: { heating: false, cooling: false, pouring: false },
    B2: { heating: false, cooling: false, pouring: false },
    B3: { heating: false, cooling: false, pouring: false },
    F1: { heating: false, cooling: false, pouring: false },
    F2: { heating: false, cooling: false, pouring: false }
  });
  const [glasswarePositions, setGlasswarePositions] = useState({
    B1: [-3, 0.1, -1],
    B2: [-1, 0.1, 0.5],
    B3: [1.5, 0.1, -1.5],
    F1: [-2.5, 0.1, 1.5],
    F2: [1, 0.1, 1]
  });
  const [waterLevels, setWaterLevels] = useState({
    B1: 0.7, // 70% full
    B2: 0.3, // 30% full
    B3: 0.9, // 90% full
    F1: 0.2, // 20% full
    F2: 0.5  // 50% full
  });
  const [tapOn, setTapOn] = useState(false);
  const [uncappedState, setUncappedState] = useState({
    B1: true,
    B2: true,
    B3: true,
    F1: false,
    F2: false
  });
  const [animatingItems, setAnimatingItems] = useState(new Set()); // Track animating items

  const handleSelectItem = (id) => {
    setSelectedItem(selectedItem === id ? null : id);
    setCurrentAction(null); // Clear action when selecting new item
  };

  const handleDragStart = (id) => {
    if (selectedItem === id) {
      setIsDragging(true);
      setCurrentAction('Dragging');
    }
  };

  const handleDragEnd = (id) => {
    if (isDragging) {
      setIsDragging(false);
      setCurrentAction(null);
    }
  };

  const handlePositionUpdate = (id, newPosition) => {
    if (isDragging && selectedItem === id) {
      // For smooth dragging, update position directly without animation
      updatePosition(id, newPosition);
    }
  };

  // Smooth position animation
  const animatePosition = (id, targetPosition, duration = 300) => {
    setAnimatingItems(prev => new Set(prev).add(id));
    
    const startPosition = [...glasswarePositions[id]];
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentPosition = [
        startPosition[0] + (targetPosition[0] - startPosition[0]) * easeOut,
        startPosition[1] + (targetPosition[1] - startPosition[1]) * easeOut,
        startPosition[2] + (targetPosition[2] - startPosition[2]) * easeOut
      ];
      
      setGlasswarePositions(prev => ({
        ...prev,
        [id]: currentPosition
      }));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    };
    
    requestAnimationFrame(animate);
  };

  // Pour liquid from one container to another
  const pourLiquid = (fromId, toId, amount = 0.2) => {
    const fromLevel = waterLevels[fromId];
    const toLevel = waterLevels[toId];
    
    if (fromLevel <= 0) return; // Nothing to pour
    
    const actualAmount = Math.min(amount, fromLevel);
    const newFromLevel = Math.max(0, fromLevel - actualAmount);
    const newToLevel = Math.min(1, toLevel + actualAmount);
    
    setWaterLevels(prev => ({
      ...prev,
      [fromId]: newFromLevel,
      [toId]: newToLevel
    }));
    
    // Visual pouring effect
    setGlasswareStates(prev => ({
      ...prev,
      [fromId]: { ...prev[fromId], pouring: true },
      [toId]: { ...prev[toId], pouring: true }
    }));
    
    setTimeout(() => {
      setGlasswareStates(prev => ({
        ...prev,
        [fromId]: { ...prev[fromId], pouring: false },
        [toId]: { ...prev[toId], pouring: false }
      }));
    }, 3000);
  };

  // Check if two containers are close enough to pour between them
  const canPourBetween = (fromId, toId) => {
    const fromPos = glasswarePositions[fromId];
    const toPos = glasswarePositions[toId];
    const distance = Math.sqrt(
      Math.pow(fromPos[0] - toPos[0], 2) + 
      Math.pow(fromPos[2] - toPos[2], 2)
    );
    return distance < 1.5; // Within pouring distance
  };

  const tapPosition = [4.5, 0.95, 0];
  const canFillFromTap = (id) => {
    const pos = glasswarePositions[id];
    const distance = Math.sqrt(
      Math.pow(pos[0] - tapPosition[0], 2) +
      Math.pow(pos[2] - tapPosition[2], 2)
    );
    return distance < 1.5 && (id.startsWith('B') || uncappedState[id]);
  };

  const updatePosition = (id, newPosition) => {
    setGlasswarePositions(prev => ({
      ...prev,
      [id]: newPosition
    }));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedItem) return;

      const moveAmount = 0.2;
      const currentPos = glasswarePositions[selectedItem];
      let newPos = [...currentPos];

      switch (e.key.toUpperCase()) {
        case 'W':
          newPos[2] -= moveAmount; // Move forward (Z axis)
          e.preventDefault();
          break;
        case 'S':
          newPos[2] += moveAmount; // Move backward (Z axis)
          e.preventDefault();
          break;
        case 'A':
          newPos[0] -= moveAmount; // Move left (X axis)
          e.preventDefault();
          break;
        case 'D':
          newPos[0] += moveAmount; // Move right (X axis)
          e.preventDefault();
          break;
        case 'E':
          setCurrentAction('Pouring/Dispensing');
          setGlasswareStates(prev => ({
            ...prev,
            [selectedItem]: { ...prev[selectedItem], pouring: true, heating: false, cooling: false }
          }));
          
          // Check if we can pour into another container
          const otherContainers = Object.keys(glasswarePositions).filter(id => id !== selectedItem);
          const targetContainer = otherContainers.find(id => canPourBetween(selectedItem, id));
          
          if (targetContainer && waterLevels[selectedItem] > 0) {
            pourLiquid(selectedItem, targetContainer, 0.15);
            setCurrentAction('Pouring into nearby container');
          } else {
            // Pour out (reduce water level)
            setWaterLevels(prev => ({
              ...prev,
              [selectedItem]: Math.max(0, prev[selectedItem] - 0.1)
            }));
          }
          
          setTimeout(() => {
            setCurrentAction(null);
            setGlasswareStates(prev => ({
              ...prev,
              [selectedItem]: { ...prev[selectedItem], pouring: false }
            }));
          }, 3000);
          console.log('Pouring/Dispensing from', selectedItem);
          e.preventDefault();
          break;
        case 'U':
          if (selectedItem && selectedItem.startsWith('F')) {
            const willUncap = !uncappedState[selectedItem];
            setUncappedState(prev => ({
              ...prev,
              [selectedItem]: willUncap
            }));
            setCurrentAction(willUncap ? 'Uncapping flask' : 'Capping flask');
            setTimeout(() => setCurrentAction(null), 1500);
            e.preventDefault();
          }
          break;
        case 'T':
          if (!selectedItem) {
            setTapOn(prev => !prev);
            setCurrentAction(tapOn ? 'Tap turned off' : 'Tap turned on');
            setTimeout(() => setCurrentAction(null), 1200);
            e.preventDefault();
            break;
          }

          const willTurnOn = !tapOn;
          setTapOn(willTurnOn);
          if (willTurnOn && canFillFromTap(selectedItem)) {
            setCurrentAction('Filling D.I. water');
            setWaterLevels(prev => ({
              ...prev,
              [selectedItem]: Math.min(1, prev[selectedItem] + 0.25)
            }));
            setTimeout(() => setCurrentAction(null), 2000);
          } else {
            setCurrentAction(willTurnOn ? 'Tap turned on' : 'Tap turned off');
            setTimeout(() => setCurrentAction(null), 1200);
          }
          e.preventDefault();
          break;
        case 'C':
          setCurrentAction('Cooling down');
          setGlasswareStates(prev => ({
            ...prev,
            [selectedItem]: { ...prev[selectedItem], cooling: true, heating: false, pouring: false }
          }));
          setTimeout(() => {
            setCurrentAction(null);
            setGlasswareStates(prev => ({
              ...prev,
              [selectedItem]: { ...prev[selectedItem], cooling: false }
            }));
          }, 4000);
          console.log('Cooling down', selectedItem);
          e.preventDefault();
          break;
        case 'H':
          setCurrentAction('Heating/Boiling');
          setGlasswareStates(prev => ({
            ...prev,
            [selectedItem]: { ...prev[selectedItem], heating: true, cooling: false, pouring: false }
          }));
          setTimeout(() => {
            setCurrentAction(null);
            setGlasswareStates(prev => ({
              ...prev,
              [selectedItem]: { ...prev[selectedItem], heating: false }
            }));
          }, 4000);
          console.log('Heating', selectedItem);
          e.preventDefault();
          break;
        case 'R':
          // Raise height (Y+) with animation
          const raisePos = [...glasswarePositions[selectedItem]];
          raisePos[1] += 0.2;
          animatePosition(selectedItem, raisePos, 200);
          setCurrentAction('Raising height');
          setTimeout(() => setCurrentAction(null), 200);
          e.preventDefault();
          break;
        case 'F':
          // Lower height (Y-) with animation
          const lowerPos = [...glasswarePositions[selectedItem]];
          lowerPos[1] -= 0.2;
          animatePosition(selectedItem, lowerPos, 200);
          setCurrentAction('Lowering height');
          setTimeout(() => setCurrentAction(null), 200);
          e.preventDefault();
          break;
        default:
          break;
      }

      if (newPos !== currentPos) {
        updatePosition(selectedItem, newPos);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, glasswarePositions, animatePosition, canPourBetween, pourLiquid, waterLevels]);

  useEffect(() => {
    const handleWheel = (e) => {
      if (!selectedItem) return;
      e.preventDefault();
      
      const currentPos = glasswarePositions[selectedItem];
      const newPos = [...currentPos];
      newPos[1] += (e.deltaY > 0 ? -0.1 : 0.1); // Y axis (height)
      
      updatePosition(selectedItem, newPos);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [selectedItem, glasswarePositions]);

  return (
    <div style={{ height: '100vh', width: '100%', background: '#e8e8e8', position: 'relative' }}>
      <LabHUD selectedItem={selectedItem} currentAction={currentAction} glasswareStates={glasswareStates} waterLevels={waterLevels} tapOn={tapOn} uncappedState={uncappedState} />
      <Canvas 
        camera={{ position: [8, 4, 8], fov: 50 }}
        style={{ background: 'linear-gradient(to bottom, #e8e8e8 0%, #d0d0d0 100%)' }}
      >
        <LabSceneContent 
          selectedItem={selectedItem}
          onSelectItem={handleSelectItem}
          glasswarePositions={glasswarePositions}
          glasswareStates={glasswareStates}
          onUpdatePosition={updatePosition}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onPositionUpdate={handlePositionUpdate}
          isDragging={isDragging}
          waterLevels={waterLevels}
          tapOn={tapOn}
          uncappedState={uncappedState}
        />
      </Canvas>
    </div>
  );
}

export default Experiment;