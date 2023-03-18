import type {
  Client_userInfo,
  mapOriginDataResult,
} from "@/common/js/nostr-tools/nostr-tools.d";

export interface AvatarSource extends mapOriginDataResult {
  client_userInfo?: Client_userInfo;
}
