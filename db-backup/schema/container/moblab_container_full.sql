IF DB_ID('MobLab') IS NULL CREATE DATABASE [MobLab];
GO
USE [MobLab]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Tables
CREATE TABLE [dbo].[Brands](
	[BrandID] [int] IDENTITY(1,1) NOT NULL,
	[BrandName] [nvarchar](50) NULL,
	[ImageID] [int] NULL,
	[Country] [nvarchar](50) NULL,
	[YearFounded] [int] NULL,
	[Description] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED ([BrandID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[Carriers](
	[CarrierID] [int] IDENTITY(1,1) NOT NULL,
	[CarrierName] [nvarchar](100) NULL,
	[ShippingCost] [decimal](10, 2) NULL,
PRIMARY KEY CLUSTERED ([CarrierID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[Images](
	[ImageID] [int] IDENTITY(1,1) NOT NULL,
	[ImagePath] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED ([ImageID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[Inventory](
	[InventoryID] [int] IDENTITY(1,1) NOT NULL,
	[WarehouseID] [int] NULL,
	[VersionID] [int] NULL,
	[Quantity] [int] NULL,
	[LastUpdated] [date] NULL,
PRIMARY KEY CLUSTERED ([InventoryID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[OrderDetails](
	[OrderDetailID] [int] IDENTITY(1,1) NOT NULL,
	[OrderID] [int] NULL,
	[VersionID] [int] NULL,
	[Quantity] [int] NULL,
	[UnitPrice] [decimal](10, 2) NULL,
PRIMARY KEY CLUSTERED ([OrderDetailID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[Orders](
	[OrderID] [int] IDENTITY(1,1) NOT NULL,
	[UserID] [int] NULL,
	[OrderDate] [date] NULL,
	[TotalAmount] [decimal](10, 2) NULL,
	[Status] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED ([OrderID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[Payments](
	[PaymentID] [int] IDENTITY(1,1) NOT NULL,
	[OrderID] [int] NULL,
	[PaymentDate] [date] NULL,
	[PaymentMethod] [nvarchar](50) NULL,
	[Amount] [decimal](10, 2) NULL,
PRIMARY KEY CLUSTERED ([PaymentID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[ProductDetails](
	[DetailID] [int] IDENTITY(1,1) NOT NULL,
	[ProductID] [int] NULL,
	[Display] [nvarchar](50) NULL,
	[Battery] [nvarchar](50) NULL,
	[Camera] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED ([DetailID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[Products](
	[ProductID] [int] IDENTITY(1,1) NOT NULL,
	[BrandID] [int] NULL,
	[ModelName] [nvarchar](100) NULL,
	[Price] [decimal](10, 2) NULL,
PRIMARY KEY CLUSTERED ([ProductID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[ProductVersions](
	[VersionID] [int] IDENTITY(1,1) NOT NULL,
	[ProductID] [int] NULL,
	[ImageID] [int] NULL,
	[Color] [nvarchar](50) NULL,
	[Storage] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED ([VersionID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[Reviews](
	[ReviewID] [int] IDENTITY(1,1) NOT NULL,
	[ProductID] [int] NULL,
	[UserID] [int] NULL,
	[Rating] [int] NULL,
	[Comment] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED ([ReviewID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[Roles](
	[RoleID] [int] IDENTITY(1,1) NOT NULL,
	[RoleName] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED ([RoleID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[Shipping](
	[ShippingID] [int] IDENTITY(1,1) NOT NULL,
	[OrderID] [int] NULL,
	[CarrierID] [int] NULL,
	[Address] [nvarchar](255) NULL,
	[City] [nvarchar](50) NULL,
	[Status] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED ([ShippingID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[SupportTickets](
	[TicketID] [int] IDENTITY(1,1) NOT NULL,
	[UserID] [int] NULL,
	[Subject] [nvarchar](100) NULL,
	[Description] [nvarchar](255) NULL,
	[Status] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED ([TicketID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[Users](
	[UserID] [int] IDENTITY(1,1) NOT NULL,
	[FullName] [nvarchar](100) NULL,
	[Email] [nvarchar](100) NULL,
	[PasswordHash] [nvarchar](255) NULL,
	[RoleID] [int] NULL,
PRIMARY KEY CLUSTERED ([UserID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[Warehouses](
	[WarehouseID] [int] IDENTITY(1,1) NOT NULL,
	[WarehouseName] [nvarchar](100) NULL,
	[City] [nvarchar](50) NULL,
	[SurfaceArea] [int] NULL,
PRIMARY KEY CLUSTERED ([WarehouseID] ASC)
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[Wishlist](
	[WishlistID] [int] IDENTITY(1,1) NOT NULL,
	[UserID] [int] NULL,
	[ProductID] [int] NULL,
	[DateAdded] [date] NULL,
PRIMARY KEY CLUSTERED ([WishlistID] ASC)
) ON [PRIMARY]
GO

-- Seed (subset preserved)
SET IDENTITY_INSERT [dbo].[Products] ON 
INSERT [dbo].[Products] ([ProductID], [BrandID], [ModelName], [Price]) VALUES (1, 1, N'iPhone 15 Pro', CAST(1899.99 AS Decimal(10, 2)))
INSERT [dbo].[Products] ([ProductID], [BrandID], [ModelName], [Price]) VALUES (2, 2, N'Samsung Galaxy S24', CAST(1599.99 AS Decimal(10, 2)))
INSERT [dbo].[Products] ([ProductID], [BrandID], [ModelName], [Price]) VALUES (3, 3, N'Xiaomi 14 Ultra', CAST(1199.99 AS Decimal(10, 2)))
INSERT [dbo].[Products] ([ProductID], [BrandID], [ModelName], [Price]) VALUES (4, 4, N'Huawei P60 Pro', CAST(1099.99 AS Decimal(10, 2)))
SET IDENTITY_INSERT [dbo].[Products] OFF
GO

-- Indexes
ALTER TABLE [dbo].[Users] ADD UNIQUE NONCLUSTERED ([Email] ASC)
GO

-- Foreign Keys (optional; comment out if errors occur on initial load)
ALTER TABLE [dbo].[Brands]  WITH CHECK ADD FOREIGN KEY([ImageID]) REFERENCES [dbo].[Images] ([ImageID])
GO
ALTER TABLE [dbo].[Inventory]  WITH CHECK ADD FOREIGN KEY([VersionID]) REFERENCES [dbo].[ProductVersions] ([VersionID])
GO
ALTER TABLE [dbo].[Inventory]  WITH CHECK ADD FOREIGN KEY([WarehouseID]) REFERENCES [dbo].[Warehouses] ([WarehouseID])
GO
ALTER TABLE [dbo].[OrderDetails]  WITH CHECK ADD FOREIGN KEY([OrderID]) REFERENCES [dbo].[Orders] ([OrderID])
GO
ALTER TABLE [dbo].[OrderDetails]  WITH CHECK ADD FOREIGN KEY([VersionID]) REFERENCES [dbo].[ProductVersions] ([VersionID])
GO
ALTER TABLE [dbo].[Orders]  WITH CHECK ADD FOREIGN KEY([UserID]) REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[Payments]  WITH CHECK ADD FOREIGN KEY([OrderID]) REFERENCES [dbo].[Orders] ([OrderID])
GO
ALTER TABLE [dbo].[ProductDetails]  WITH CHECK ADD FOREIGN KEY([ProductID]) REFERENCES [dbo].[Products] ([ProductID])
GO
ALTER TABLE [dbo].[Products]  WITH CHECK ADD FOREIGN KEY([BrandID]) REFERENCES [dbo].[Brands] ([BrandID])
GO
ALTER TABLE [dbo].[ProductVersions]  WITH CHECK ADD FOREIGN KEY([ImageID]) REFERENCES [dbo].[Images] ([ImageID])
GO
ALTER TABLE [dbo].[ProductVersions]  WITH CHECK ADD FOREIGN KEY([ProductID]) REFERENCES [dbo].[Products] ([ProductID])
GO
ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD FOREIGN KEY([ProductID]) REFERENCES [dbo].[Products] ([ProductID])
GO
ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD FOREIGN KEY([UserID]) REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[Shipping]  WITH CHECK ADD FOREIGN KEY([CarrierID]) REFERENCES [dbo].[Carriers] ([CarrierID])
GO
ALTER TABLE [dbo].[Shipping]  WITH CHECK ADD FOREIGN KEY([OrderID]) REFERENCES [dbo].[Orders] ([OrderID])
GO
ALTER TABLE [dbo].[SupportTickets]  WITH CHECK ADD FOREIGN KEY([UserID]) REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD FOREIGN KEY([RoleID]) REFERENCES [dbo].[Roles] ([RoleID])
GO
ALTER TABLE [dbo].[Wishlist]  WITH CHECK ADD FOREIGN KEY([ProductID]) REFERENCES [dbo].[Products] ([ProductID])
GO
ALTER TABLE [dbo].[Wishlist]  WITH CHECK ADD FOREIGN KEY([UserID]) REFERENCES [dbo].[Users] ([UserID])
GO

