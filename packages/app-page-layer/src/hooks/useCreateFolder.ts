import { currentForest, getId } from "@atrilabs/core";
import { createFolder } from "@atrilabs/server-client/lib/websocket";
import { useCallback } from "react";

export const useCreateFolder = () => {
  const createFolderCb = useCallback(
    (name: string, onSuccess: () => void, onFailure: () => void) => {
      createFolder(
        currentForest.name,
        { name: name, id: getId(), parentId: "root" },
        onSuccess,
        onFailure
      );
    },
    []
  );
  return createFolderCb;
};
