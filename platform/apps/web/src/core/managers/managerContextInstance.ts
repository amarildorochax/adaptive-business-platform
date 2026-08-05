import { createContext } from "react";
import type { ManagerRegistry } from "./buildManagers";

export const ManagerContext = createContext<ManagerRegistry | undefined>(undefined);
