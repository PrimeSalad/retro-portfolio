/**
 * File: js/state.js
 * Description: Central state management for the portfolio.
 */

import { SECTION_KEYS } from "./utils.js";

export const STATE = {
  currentImages: [],
  lightboxIndex: 0,
  lightboxItems: [],
  projectQuery: "",
  projectSort: "impact",
  projectPage: 1,
  certQuery: "",
  certSort: "newest",
  galleryFilter: "all",
  activeTimelineFilter: "all",
  timelineExpandedAll: false,
  activeTab: SECTION_KEYS.ALL,
};

export const DATA = {
  IMAGE_ITEMS: [],
  PROJECTS: [],
  TIMELINE_ITEMS: [],
  CERTS: [],
  ACHIEVEMENTS: [],
  GALLERY_ITEMS: [],
};

export function updateData(newData) {
  if (newData.images) DATA.IMAGE_ITEMS = newData.images;
  if (newData.projects) DATA.PROJECTS = newData.projects;
  if (newData.timeline) DATA.TIMELINE_ITEMS = newData.timeline;
  if (newData.certs) DATA.CERTS = newData.certs;
  if (newData.achievements) DATA.ACHIEVEMENTS = newData.achievements;
  if (newData.gallery) DATA.GALLERY_ITEMS = newData.gallery;
}
