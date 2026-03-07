/**
 * Application (COLA) related types and interfaces
 */

export interface ApplicationData {
  id?: string;
  brandName: string;
  alcoholByVolume: number;
  netContents: string;
  producerName: string;
  governmentWarning: string;
  colaNumber?: string;
  approvalDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface COLAApplication extends ApplicationData {
  federalPermitNumber?: string;
  bottlerAddress?: string;
  bottlerCountry?: string;
  importerInfo?: string;
  productCategory?: string;
  bottlingDate?: Date;
}

export interface ApplicationCreateRequest {
  brandName: string;
  alcoholByVolume: number;
  netContents: string;
  producerName: string;
  governmentWarning: string;
  colaNumber?: string;
  approvalDate?: string;
}

export interface ApplicationUpdateRequest {
  brandName?: string;
  alcoholByVolume?: number;
  netContents?: string;
  producerName?: string;
  governmentWarning?: string;
  colaNumber?: string;
  approvalDate?: string;
}

export interface BatchApplicationUploadRequest {
  applications: ApplicationCreateRequest[];
  skipOnError?: boolean;
}
