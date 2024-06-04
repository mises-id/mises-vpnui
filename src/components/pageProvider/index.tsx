import { configData } from "@/api";
import { createContext } from "@/utils/createContext";

// todo:去掉accountData
interface pageValueProps {
  configData: configData | undefined,
}
export const [usePageValue, PageValueProvider] = createContext<pageValueProps>("usePageValue")