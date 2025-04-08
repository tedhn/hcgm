-- CreateTable
CREATE TABLE "Admin" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT DEFAULT '',
    "password" TEXT DEFAULT '',
    "email" TEXT DEFAULT '',
    "phone" TEXT DEFAULT '',
    "role" TEXT DEFAULT '',

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ssmRegistrationNo" TEXT DEFAULT '',
    "taxIdentificationNo" TEXT DEFAULT '',
    "sstNo" TEXT DEFAULT '',
    "msicCode" TEXT DEFAULT '',
    "businessNature" TEXT DEFAULT '',
    "picName" TEXT DEFAULT '',
    "email" TEXT DEFAULT '',
    "phoneNo" TEXT DEFAULT '',
    "address" TEXT DEFAULT '',
    "creditTerm" TEXT DEFAULT '',
    "adminId" INTEGER DEFAULT 0,
    "creditLimit" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "baseUom" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "docNum" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "customerId" INTEGER NOT NULL,
    "adminId" INTEGER NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "refDocNo" TEXT,
    "deliveryDate" TIMESTAMP(3),
    "shippingMethod" TEXT,
    "commission" DOUBLE PRECISION,
    "remark" TEXT,
    "status" TEXT NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_code_key" ON "Customer"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_docNum_key" ON "Transaction"("docNum");
