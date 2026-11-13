import type { Status } from "@/domain/types";
import { AliveIcon } from "./AliveIcon";
import type { IconProps } from "./anim";
import { BuriedIcon } from "./BuriedIcon";
import { GhostIcon } from "./GhostIcon";
import { LostIcon } from "./LostIcon";
import { ZombieIcon } from "./ZombieIcon";

const ICONS = {
  alive: AliveIcon,
  zombie: ZombieIcon,
  ghost: GhostIcon,
  buried: BuriedIcon,
  lost: LostIcon,
} satisfies Record<Status, (props: IconProps) => React.JSX.Element>;

export function StatusIcon({ status, ...props }: IconProps & { status: Status }) {
  const Icon = ICONS[status];
  return <Icon {...props} />;
}
