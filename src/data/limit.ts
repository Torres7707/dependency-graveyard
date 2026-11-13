import pLimit from "p-limit";
import { REQUEST_CONCURRENCY } from "@/domain/config";

/** One shared queue so the whole app never has more than a few requests in flight. */
export const limit = pLimit(REQUEST_CONCURRENCY);
