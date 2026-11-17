declare module 'threejs-components/build/cursors/tubes1.min.js' {
  export type TubesOptions = {
    bloom?: { threshold?: number; strength?: number; radius?: number } | false
    tubes?: {
      count?: number
      colors?: string[]
      minRadius?: number
      maxRadius?: number
      minTubularSegments?: number
      maxTubularSegments?: number
      lerp?: number
      noise?: number
      lights?: { intensity?: number; colors?: string[] }
    }
    sleepRadiusX?: number
    sleepRadiusY?: number
    sleepTimeScale1?: number
    sleepTimeScale2?: number
  }
  export type TubesApp = {
    three: {
      maxPixelRatio: number
      minPixelRatio: number
      resize: () => void
      onBeforeRender: (time: { elapsed: number; delta: number }) => void
    }
    /** Live options object; the idle loop reads sleepRadius* and sleepTimeScale* every frame. */
    options: Required<Pick<TubesOptions, 'sleepRadiusX' | 'sleepRadiusY' | 'sleepTimeScale1' | 'sleepTimeScale2'>>
    tubes: {
      /** Live options; `lerp` is read every frame by each tube's trail. */
      options: { lerp: number; noise: number }
      setColors: (colors: string[]) => void
      setLightsColors: (colors: string[]) => void
      setLightsIntensity: (n: number) => void
    }
    dispose: () => void
  }
  export default function TubesCursor(canvas: HTMLCanvasElement, options?: TubesOptions): TubesApp
}
