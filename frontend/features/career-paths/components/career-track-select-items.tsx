import {
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import { TRACK_TYPE_META } from "@/features/career-paths/utils/career-constants";

interface CareerTrack {
  id: string;
  name: string;
  track_type: string;
  career_levels: { id: string; name: string; is_transition_point: boolean }[];
}

interface CareerTrackSelectItemsProps {
  tracks: CareerTrack[];
}

export function CareerTrackSelectItems({ tracks }: CareerTrackSelectItemsProps) {
  return (
    <>
      {tracks.map((track) => {
        const meta = TRACK_TYPE_META[track.track_type as keyof typeof TRACK_TYPE_META];
        return (
          <SelectGroup key={track.id}>
            <SelectLabel className="flex items-center gap-1.5 text-xs">
              <span className={`h-1.5 w-1.5 rounded-full ${meta?.dot ?? "bg-gray-400"}`} />
              {track.name}
            </SelectLabel>
            {track.career_levels.map((level) => (
              <SelectItem key={level.id} value={level.id}>
                {level.name}
                {level.is_transition_point && " ↕"}
              </SelectItem>
            ))}
          </SelectGroup>
        );
      })}
    </>
  );
}
