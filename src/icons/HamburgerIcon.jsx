/**
 * ハンバーガーメニューアイコンコンポーネント
 *
 * 3本の水平線で構成されるハンバーガーメニューアイコンを表示します。
 * モバイルナビゲーションの開閉ボタンとして使用されます。
 *
 * Props:
 * - className: 追加のCSSクラス（オプション）
 *
 * 使用例:
 * <HamburgerIcon className="menu-icon" onClick={handleMenuClick} />
 */
export const HamburgerIcon = ({ className }) => {
  return (
    <svg
      className={className}
      width='24' // SVGの幅（24px）
      height='24' // SVGの高さ（24px）
      viewBox='0 0 24 24' // SVGの表示領域（0,0から24,24の範囲）
      fill='none' // 塗りつぶしなし（線のみ）
      xmlns='http://www.w3.org/2000/svg' // SVG用の標準的なURL。「このタグはSVGですよ」とブラウザに伝える
    >
      {/* 3本の水平線を描画 */}
      <path
        d='M3 12H21M3 6H21M3 18H21' // SVGパス：3本の水平線
        // M3 12H21: 上から2番目の線（y=12）
        // M3 6H21:  上から1番目の線（y=6）
        // M3 18H21: 上から3番目の線（y=18）
        stroke='currentColor' // 線の色（親要素のcolorを継承）
        strokeWidth='2' // 線の太さ（2px）
        strokeLinecap='round' // 線の端を丸く
        strokeLinejoin='round' // 線の接続部分を丸く
      />
    </svg>
  )
}
