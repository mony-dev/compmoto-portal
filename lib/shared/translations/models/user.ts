import { DateTime } from "luxon";

export interface User {
  id: number;
  email?: string;
  name?: string;
  role: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  status: string;
  language: string;
  paymentTerms?: string;
  creditPoint?: number;
  rewardPoint: number;
  phoneNumber?: string;
  birthDate?: DateTime;
  gender?: string;
  vatNo?: string;
  custAddress?: string;
  shipToAddress?: string;
  balanceLCY?: number;
  contactName?: string;
  custPriceGroup?: string;
  custNo: string;
}

