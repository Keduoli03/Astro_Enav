<script lang="ts">
import { DARK_MODE, LIGHT_MODE } from "../../constants/constants";
import {
	applyThemeToDocument,
	getStoredTheme,
	setTheme,
} from "../../utils/theme-utils";
import { onMount } from "svelte";
import type { LIGHT_DARK_MODE } from "../../types/config";

let mode: LIGHT_DARK_MODE = LIGHT_MODE;
let isAnimating = false;

onMount(() => {
	const storedTheme = getStoredTheme();
	// 如果存储的是AUTO_MODE，默认设为LIGHT_MODE
	mode = (storedTheme === LIGHT_MODE || storedTheme === DARK_MODE) ? storedTheme : LIGHT_MODE;
	applyThemeToDocument(mode);
});

/**
 * Handle theme toggle with smooth animated transition effect
 * @param event Mouse event for click coordinates
 * @param newMode The target theme mode
 */
function triggerThemeTransition(event: MouseEvent, newMode: LIGHT_DARK_MODE) {
	if (isAnimating || mode === newMode) return;

	isAnimating = true;

	const trigger = () => {
		mode = newMode;
		setTheme(mode);
		applyThemeToDocument(mode);
	};

	// 检查是否支持 View Transition API
	if (!document.startViewTransition) {
		// 降级处理：如果不支持 View Transition API
		trigger();
		isAnimating = false;
		return;
	}

	const transition = document.startViewTransition(trigger);

	// 获取点击坐标用于径向动画起点
	const x = event.clientX;
	const y = event.clientY;

	transition.ready.then(() => {
		// 使用更大的半径和更平滑的缓动函数
		const endRadius = Math.hypot(
			Math.max(x, innerWidth - x),
			Math.max(y, innerHeight - y),
		);

		// 创建更平滑的圆形扩散动画
		const clipPath = [
			`circle(0px at ${x}px ${y}px)`,
			`circle(${endRadius}px at ${x}px ${y}px)`,
		];

		document.documentElement.animate(
			{
				clipPath: mode === DARK_MODE ? clipPath : [...clipPath].reverse(),
			},
			{
				duration: 600,
				easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
				pseudoElement:
					mode === DARK_MODE
						? "::view-transition-new(root)"
						: "::view-transition-old(root)",
			},
		);
	});

	transition.finished.then(() => {
		isAnimating = false;
	});
}

// 简化的切换函数，只在亮色和暗色之间切换
function toggleScheme(event: MouseEvent): void {
	const newMode = mode === LIGHT_MODE ? DARK_MODE : LIGHT_MODE;
	triggerThemeTransition(event, newMode);
}
</script>

<!-- 简化的组件，只保留一个按钮 -->
<div class="theme-switch-wrapper">
    <button 
        aria-label="切换主题模式" 
        class="btn rounded-circle theme-switch-btn m-1 transition-all duration-200" 
        class:opacity-75={isAnimating}
        id="scheme-switch" 
        on:click={toggleScheme}
        title="点击切换：亮色 ⇄ 暗色"
    >
        <!-- 根据当前主题显示图标 -->
        {#if mode === DARK_MODE}
            <i class="iconfont icon-night text-lg"></i>
        {:else}
            <i class="iconfont icon-light text-lg"></i>
        {/if}
    </button>
</div>

<style>
.theme-switch-wrapper {
  position: relative;
  width: 44px;
}

.theme-switch-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--btn-bg, rgba(255,255,255,0.1));
  border: 1px solid var(--btn-border, rgba(255,255,255,0.2));
  backdrop-filter: blur(10px);
}

.theme-switch-btn:hover {
  background: var(--btn-bg-hover, rgba(255,255,255,0.2));
  transform: scale(1.05);
}

/* 暗色模式样式 */
:global(.io-black-mode) .theme-switch-btn {
  --btn-bg: rgba(0,0,0,0.3);
  --btn-border: rgba(255,255,255,0.1);
  --btn-bg-hover: rgba(0,0,0,0.5);
}

/* 优化 View Transitions 样式 */
:global(::view-transition-old(root)),
:global(::view-transition-new(root)) {
  animation-duration: 0.6s;
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: none;
  filter: none;
}

:global(::view-transition-old(root)) {
  z-index: 1;
}

:global(::view-transition-new(root)) {
  z-index: 2;
}

:global(::view-transition-group(root)) {
  animation-duration: 0.6s;
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

:global(html) {
  view-transition-name: root;
}
</style>