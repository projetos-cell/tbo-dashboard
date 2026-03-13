import { Button } from "@/components/ui/button";
import { IconBrandGithub } from "@tabler/icons-react";

export default function GHSignin() {
  return (
    <Button variant="outline" className="w-full">
      <IconBrandGithub />
      Continue with GitHub
    </Button>
  );
}
