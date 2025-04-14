export type UserType = {
  ID: number;
  CREATED_AT: Date;
  NAME?: string;
  PASSWORD?: string;
  EMAIL?: string;
  PHONE?: string;
  ROLE?: string;
  CODE?: string;
};

export type Customer = {
  ID: bigint;
  CREATED_AT: Date;
  CODE: string;
  NAME: string;
  SSM_REGISTRATION_NO?: string;
  TAX_IDENTIFICATION_NO?: string;
  SST_NO?: string;
  MSIC_CODE?: string;
  BUSINESS_NATURE?: string;
  PIC_NAME?: string;
  EMAIL?: string;
  PHONE_NO?: string;
  ADDRESS?: string;
  CREDIT_TERM?: string;
  ADMIN_ID?: number;
  CREDIT_LIMIT?: number;
};

export type ProductType = {
  ID: number;
  CODE: string;
  NAME: string;
  CATEGORY: string;
  BASE_UOM: string;
  STOCK: number;
  UNIT_PRICE: number;
};

export type Transaction = {
  ID: number;
  DOC_NUM: string;
  TRANSACTION_DATE: Date;
  CUSTOMER_ID: number;
  ADMIN_ID: number;
  TOTAL_PRICE: number;
  REF_DOC_NO?: string;
  DELIVERY_DATE?: Date;
  SHIPPING_METHOD?: string;
  COMISSION?: number;
  REMARK?: string;
  STATUS: string;
};

export type Transaction_Detail = {
  ID: number;
  TRANSACTION_ID: number;
  PRODUCT_ID: number;
  QTY: number;
  UNIT_PRICE: number;
};

export interface DropDownType {
  id: number;
  name: string;
}
