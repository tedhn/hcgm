export type Admin = {
  id: number;
  created_at: Date;
  name?: string;
  password?: string;
  email?: string;
  phone?: string;
  role?: string;
};

export type Customer = {
  id:  bigint;
  created_at: Date;
  code: string;
  name: string;
  ssmRegistrationNo?: string;
  taxIdentificationNo?: string;
  sstNo?: string;
  msicCode?: string;
  businessNature?: string;
  picName?: string;
  email?: string;
  phoneNo?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  address4?: string;
  creditTerm?: string;
  adminId?: number;
  creditLimit?: number;
};

export type Product = {
  id: number;
  code: string;
  name: string;
  category: string;
  baseUom: string;
  stock: number;
  unitPrice: number;
};

export type Transaction = {
  id: number;
  docNum: string;
  transactionDate: Date;
  customerId: number;
  adminId: number;
  totalPrice: number;
  refDocNo?: string;
  deliveryDate?: Date;
  shippingMethod?: string;
  commission?: number;
  remark?: string;
  status: string;
};
