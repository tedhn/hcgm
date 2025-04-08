-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "code" TEXT DEFAULT '',
    "name" TEXT DEFAULT '',
    "email" TEXT DEFAULT '',
    "phone" TEXT DEFAULT '',
    "role" TEXT DEFAULT '',
    "password" TEXT DEFAULT '',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "ssmRegistrationNo" TEXT DEFAULT '',
    "taxIdentificationNo" TEXT DEFAULT '',
    "sstNo" TEXT DEFAULT '',
    "msicCode" TEXT DEFAULT '',
    "businessNature" TEXT DEFAULT '',
    "picName" TEXT DEFAULT '',
    "email" TEXT DEFAULT '',
    "phoneNo" TEXT DEFAULT '',
    "address" TEXT DEFAULT '',
    "creditTerm" TEXT NOT NULL DEFAULT '',
    "adminId" INTEGER NOT NULL DEFAULT 0,
    "creditLimit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "baseUom" TEXT NOT NULL DEFAULT '',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,

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

-- CreateTable
CREATE TABLE "Transaction_Detail" (
    "id" SERIAL NOT NULL,
    "transactionId" INTEGER NOT NULL,
    "ProductId" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Transaction_Detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_docNum_key" ON "Transaction"("docNum");
