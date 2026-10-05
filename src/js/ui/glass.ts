export const ease = 'cubic-bezier(0.22,1,0.36,1)'
export const glassUi = {
  base: 'h-12 rounded-full bg-white/60 backdrop-blur-xl ring-white/75 text-base',
  content: [
    'rounded-3xl p-2 bg-white/55 backdrop-blur-2xl backdrop-saturate-[1.8]',
    'ring-1 ring-white/70 shadow-[0_20px_50px_rgba(0,0,0,.18)]',
    // 往下展開
    'data-[state=open]:animate-[slide-in_220ms_cubic-bezier(0.22,1,0.36,1)]',
    'data-[state=closed]:animate-[slide-out_100ms_cubic-bezier(0.22,1,0.36,1)]',
    // 翻到上方時反方向
    'data-[side=top]:data-[state=open]:animate-[slide-in-up_220ms_cubic-bezier(0.22,1,0.36,1)]',
    'data-[side=top]:data-[state=closed]:animate-[slide-out-down_100ms_cubic-bezier(0.22,1,0.36,1)]',
  ].join(' '),
  viewport: 'divide-y-0',
  item: [
    'items-center px-4 py-3 text-[16.5px] rounded-2xl before:rounded-2xl',
    'transition-none before:transition-none',  // hover／方向鍵切換時底色立即變化
    'data-highlighted:not-data-disabled:before:bg-black/5',
    'data-[state=checked]:before:bg-[#f5e1c3]/85 data-[state=checked]:text-[#8a5a12]',
  ].join(' '),
  itemTrailingIcon: 'hidden',
}