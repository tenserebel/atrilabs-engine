import { currentForest } from "@atrilabs/core";
import { getMeta, getPages } from "@atrilabs/server-client/lib/websocket";
import { useEffect, useState } from "react";

export type PageTableData = {
  // only root's direct children are included as of now
  folder: { id: string; name: string; parentId: string };
  pages: { id: string; name: string; route: string }[];
}[];

type RawFolders = {
  [folderId: string]: { id: string; name: string; parentId: string };
};

type RawPageMap = { [pageId: string]: string };

function reverseMap(raw: RawFolders) {
  const keys = Object.keys(raw);
  const reverseMap: { [parentId: string]: string[] } = {};
  keys.forEach((key) => {
    if (reverseMap[raw[key]!.parentId]) {
      reverseMap[raw[key]!.parentId].push(key);
    } else {
      reverseMap[raw[key]!.parentId] = [key];
    }
  });
  return reverseMap;
}

function reversePageMap(raw: RawPageMap) {
  const keys = Object.keys(raw);
  const reverseMap: { [folderId: string]: string[] } = {};
  keys.forEach((key) => {
    if (reverseMap[raw[key]]) {
      reverseMap[raw[key]].push(key);
    } else {
      reverseMap[raw[key]] = [key];
    }
  });
  return reverseMap;
}

export const usePageTableData = () => {
  const [data, setData] = useState<PageTableData>([]);
  useEffect(() => {
    getMeta(currentForest.name, (meta) => {
      const folders: RawFolders = meta.folders;
      const pageMap: RawPageMap = meta.pages;
      getPages(currentForest.name, (pages) => {
        const data: PageTableData = [];
        const pageMapRev = reversePageMap(pageMap);
        console.log(reverseMap(folders));
        // TODO: create a home page in root folder
        const childFolderIds = reverseMap(folders)["root"] || [];
        childFolderIds.forEach((childId) => {
          const pageData = pageMapRev[childId]!.map((pageId) => {
            return { ...pages[pageId]!, id: pageId };
          });
          data.push({ folder: folders[childId]!, pages: pageData });
        });
        // sort folders alphabetically
        data.sort((a, b) => {
          return a.folder.name < b.folder.name ? -1 : 0;
        });
        data.forEach((subdata) => [
          subdata.pages.sort((a, b) => {
            // sort pages alphabetically
            return a.name < b.name ? -1 : 0;
          }),
        ]);
        setData(data);
      });
    });
  }, [setData]);
  return data;
};