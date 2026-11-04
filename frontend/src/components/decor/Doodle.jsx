// ─── Doodle ───────────────────────────────────────────────────────────────────
// Kit line drawings: steaming-cup, leaf, toy-mouse, yarn-ball, fish-bone,
// hearts, sparkle, dot. Decoration only — never behind text.
import { DOODLES } from './assets';

export const DOODLE_NAMES = Object.keys(DOODLES);

export default function Doodle({ name = 'steaming-cup', alt = '', className = '', ...rest }) {
  return <img src={DOODLES[name]} alt={alt} className={className} draggable="false" {...rest} />;
}
