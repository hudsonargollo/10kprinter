import { websiteRedesign } from "./website-redesign";
import { marketingAutomation } from "./marketing-automation";
import { emailMarketing } from "./email-marketing";
import { socialMedia } from "./social-media";
import type { Vertical } from "./types";

export const VERTICALS: Vertical[] = [websiteRedesign, marketingAutomation, emailMarketing, socialMedia];

export type { Vertical } from "./types";
