import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function BirthdayUniverse() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 0, 8)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    host.appendChild(renderer.domElement)

    const universe = new THREE.Group()
    scene.add(universe)

    const heartShape = new THREE.Shape()
    heartShape.moveTo(0, 0.35)
    heartShape.bezierCurveTo(0, 0.35, -0.8, 1.15, -1.7, 0.55)
    heartShape.bezierCurveTo(-2.55, -0.05, -1.45, -1.55, 0, -2.15)
    heartShape.bezierCurveTo(1.45, -1.55, 2.55, -0.05, 1.7, 0.55)
    heartShape.bezierCurveTo(0.8, 1.15, 0, 0.35, 0, 0.35)

    const heartGeometry = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.38,
      bevelEnabled: true,
      bevelSegments: 5,
      bevelSize: 0.12,
      bevelThickness: 0.12,
    })
    heartGeometry.center()
    const heart = new THREE.Mesh(
      heartGeometry,
      new THREE.MeshPhysicalMaterial({
        color: 0xe8a3bd,
        roughness: 0.28,
        metalness: 0.08,
        clearcoat: 1,
        clearcoatRoughness: 0.18,
      }),
    )
    heart.scale.setScalar(0.8)
    universe.add(heart)

    const ringGeometry = new THREE.TorusGeometry(2.15, 0.018, 8, 160)
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xd6b36a, transparent: true, opacity: 0.65 })
    const ringA = new THREE.Mesh(ringGeometry, ringMaterial)
    const ringB = ringA.clone()
    ringA.rotation.set(1.1, 0.2, 0.3)
    ringB.rotation.set(0.4, 1.2, -0.2)
    universe.add(ringA, ringB)

    const starCount = 700
    const positions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i += 1) {
      const radius = 3.2 + Math.random() * 3.8
      const angle = Math.random() * Math.PI * 2
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7
      positions[i * 3 + 2] = Math.sin(angle) * radius - 1
    }
    const starsGeometry = new THREE.BufferGeometry()
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const stars = new THREE.Points(
      starsGeometry,
      new THREE.PointsMaterial({ color: 0xf4d792, size: 0.025, transparent: true, opacity: 0.8 }),
    )
    universe.add(stars)

    scene.add(new THREE.HemisphereLight(0xfff8f1, 0x7d3655, 2.2))
    const keyLight = new THREE.DirectionalLight(0xffdcae, 3)
    keyLight.position.set(3, 4, 5)
    scene.add(keyLight)

    let pointerX = 0
    let pointerY = 0
    const handlePointer = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect()
      pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.45
      pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.35
    }
    const resize = () => {
      const width = host.clientWidth
      const height = host.clientHeight
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    host.addEventListener('pointermove', handlePointer)
    resize()

    let frame = 0
    const clock = new THREE.Clock()
    const render = () => {
      const elapsed = clock.getElapsedTime()
      if (!reducedMotion) {
        universe.rotation.y += (pointerX - universe.rotation.y) * 0.035
        universe.rotation.x += (-pointerY - universe.rotation.x) * 0.035
        heart.rotation.z = Math.sin(elapsed * 0.7) * 0.06
        ringA.rotation.z = elapsed * 0.08
        ringB.rotation.z = -elapsed * 0.06
        stars.rotation.y = elapsed * 0.025
      }
      renderer.render(scene, camera)
      frame = window.requestAnimationFrame(render)
    }
    render()

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      host.removeEventListener('pointermove', handlePointer)
      host.removeChild(renderer.domElement)
      heartGeometry.dispose()
      ringGeometry.dispose()
      ringMaterial.dispose()
      starsGeometry.dispose()
      stars.material.dispose()
      renderer.dispose()
    }
  }, [])

  return <div ref={hostRef} className="birthday-universe" aria-hidden="true" />
}
