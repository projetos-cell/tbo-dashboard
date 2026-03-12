import packageJson from "../package.json";

const currentYear = new Date().getFullYear();

export const PROJECT_CONFIG = {
  name: "TBO OS",
  description:
    "Sistema operacional interno da TBO — gestão de projetos, pessoas, finanças e inteligência.",
  version: packageJson.version,
  copyright: `© ${currentYear}, All Rights Reserved.`,
};
