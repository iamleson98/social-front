import { AccountAddress } from './models/entities/AccountAddress';
import { AccountCustomerevent } from './models/entities/AccountCustomerevent';
import { AccountCustomernote } from './models/entities/AccountCustomernote';
import { AccountGroup } from './models/entities/AccountGroup';
import { AccountGroupChannels } from './models/entities/AccountGroupChannels';
import { AccountGroupPermissions } from './models/entities/AccountGroupPermissions';
import { AccountStaffnotificationrecipient } from './models/entities/AccountStaffnotificationrecipient';
import { AccountUser } from './models/entities/AccountUser';
import { AccountUserAddresses } from './models/entities/AccountUserAddresses';
import { AccountUserGroups } from './models/entities/AccountUserGroups';
import { AccountUserUserPermissions } from './models/entities/AccountUserUserPermissions';
import { AppApp } from './models/entities/AppApp';
import { AppAppPermissions } from './models/entities/AppAppPermissions';
import { AppAppextension } from './models/entities/AppAppextension';
import { AppAppextensionPermissions } from './models/entities/AppAppextensionPermissions';
import { AppAppinstallation } from './models/entities/AppAppinstallation';
import { AppAppinstallationPermissions } from './models/entities/AppAppinstallationPermissions';
import { AppApptoken } from './models/entities/AppApptoken';
import { AttributeAssignedpageattributevalue } from './models/entities/AttributeAssignedpageattributevalue';
import { AttributeAssignedproductattributevalue } from './models/entities/AttributeAssignedproductattributevalue';
import { AttributeAssignedvariantattribute } from './models/entities/AttributeAssignedvariantattribute';
import { AttributeAssignedvariantattributevalue } from './models/entities/AttributeAssignedvariantattributevalue';
import { AttributeAttribute } from './models/entities/AttributeAttribute';
import { AttributeAttributepage } from './models/entities/AttributeAttributepage';
import { AttributeAttributeproduct } from './models/entities/AttributeAttributeproduct';
import { AttributeAttributetranslation } from './models/entities/AttributeAttributetranslation';
import { AttributeAttributevalue } from './models/entities/AttributeAttributevalue';
import { AttributeAttributevaluetranslation } from './models/entities/AttributeAttributevaluetranslation';
import { AttributeAttributevariant } from './models/entities/AttributeAttributevariant';
import { ChannelChannel } from './models/entities/ChannelChannel';
import { CheckoutCheckout } from './models/entities/CheckoutCheckout';
import { CheckoutCheckoutGiftCards } from './models/entities/CheckoutCheckoutGiftCards';
import { CheckoutCheckoutline } from './models/entities/CheckoutCheckoutline';
import { CheckoutCheckoutmetadata } from './models/entities/CheckoutCheckoutmetadata';
import { CoreEventdelivery } from './models/entities/CoreEventdelivery';
import { CoreEventdeliveryattempt } from './models/entities/CoreEventdeliveryattempt';
import { CoreEventpayload } from './models/entities/CoreEventpayload';
import { CsvExportevent } from './models/entities/CsvExportevent';
import { CsvExportfile } from './models/entities/CsvExportfile';
import { DiscountCheckoutdiscount } from './models/entities/DiscountCheckoutdiscount';
import { DiscountCheckoutlinediscount } from './models/entities/DiscountCheckoutlinediscount';
import { DiscountOrderdiscount } from './models/entities/DiscountOrderdiscount';
import { DiscountOrderlinediscount } from './models/entities/DiscountOrderlinediscount';
import { DiscountPromotion } from './models/entities/DiscountPromotion';
import { DiscountPromotionevent } from './models/entities/DiscountPromotionevent';
import { DiscountPromotionrule } from './models/entities/DiscountPromotionrule';
import { DiscountPromotionruleChannels } from './models/entities/DiscountPromotionruleChannels';
import { DiscountPromotionruleGifts } from './models/entities/DiscountPromotionruleGifts';
import { DiscountPromotionruleVariants } from './models/entities/DiscountPromotionruleVariants';
import { DiscountPromotionruletranslation } from './models/entities/DiscountPromotionruletranslation';
import { DiscountPromotiontranslation } from './models/entities/DiscountPromotiontranslation';
import { DiscountVoucher } from './models/entities/DiscountVoucher';
import { DiscountVoucherCategories } from './models/entities/DiscountVoucherCategories';
import { DiscountVoucherCollections } from './models/entities/DiscountVoucherCollections';
import { DiscountVoucherProducts } from './models/entities/DiscountVoucherProducts';
import { DiscountVoucherVariants } from './models/entities/DiscountVoucherVariants';
import { DiscountVoucherchannellisting } from './models/entities/DiscountVoucherchannellisting';
import { DiscountVouchercode } from './models/entities/DiscountVouchercode';
import { DiscountVouchercustomer } from './models/entities/DiscountVouchercustomer';
import { DiscountVouchertranslation } from './models/entities/DiscountVouchertranslation';
import { DjangoCeleryBeatClockedschedule } from './models/entities/DjangoCeleryBeatClockedschedule';
import { DjangoCeleryBeatCrontabschedule } from './models/entities/DjangoCeleryBeatCrontabschedule';
import { DjangoCeleryBeatIntervalschedule } from './models/entities/DjangoCeleryBeatIntervalschedule';
import { DjangoCeleryBeatPeriodictask } from './models/entities/DjangoCeleryBeatPeriodictask';
import { DjangoCeleryBeatPeriodictasks } from './models/entities/DjangoCeleryBeatPeriodictasks';
import { DjangoCeleryBeatSolarschedule } from './models/entities/DjangoCeleryBeatSolarschedule';
import { DjangoContentType } from './models/entities/DjangoContentType';
import { DjangoMigrations } from './models/entities/DjangoMigrations';
import { DjangoSite } from './models/entities/DjangoSite';
import { GiftcardGiftcard } from './models/entities/GiftcardGiftcard';
import { GiftcardGiftcardTags } from './models/entities/GiftcardGiftcardTags';
import { GiftcardGiftcardevent } from './models/entities/GiftcardGiftcardevent';
import { GiftcardGiftcardtag } from './models/entities/GiftcardGiftcardtag';
import { InvoiceInvoice } from './models/entities/InvoiceInvoice';
import { InvoiceInvoiceevent } from './models/entities/InvoiceInvoiceevent';
import { MenuMenu } from './models/entities/MenuMenu';
import { MenuMenuitem } from './models/entities/MenuMenuitem';
import { MenuMenuitemtranslation } from './models/entities/MenuMenuitemtranslation';
import { OrderFulfillment } from './models/entities/OrderFulfillment';
import { OrderFulfillmentline } from './models/entities/OrderFulfillmentline';
import { OrderOrder } from './models/entities/OrderOrder';
import { OrderOrderGiftCards } from './models/entities/OrderOrderGiftCards';
import { OrderOrderevent } from './models/entities/OrderOrderevent';
import { OrderOrdergrantedrefund } from './models/entities/OrderOrdergrantedrefund';
import { OrderOrdergrantedrefundline } from './models/entities/OrderOrdergrantedrefundline';
import { OrderOrderline } from './models/entities/OrderOrderline';
import { PagePage } from './models/entities/PagePage';
import { PagePagetranslation } from './models/entities/PagePagetranslation';
import { PagePagetype } from './models/entities/PagePagetype';
import { PaymentPayment } from './models/entities/PaymentPayment';
import { PaymentTransaction } from './models/entities/PaymentTransaction';
import { PaymentTransactionevent } from './models/entities/PaymentTransactionevent';
import { PaymentTransactionitem } from './models/entities/PaymentTransactionitem';
import { PermissionPermission } from './models/entities/PermissionPermission';
import { PluginsEmailtemplate } from './models/entities/PluginsEmailtemplate';
import { PluginsPluginconfiguration } from './models/entities/PluginsPluginconfiguration';
import { ProductCategory } from './models/entities/ProductCategory';
import { ProductCategorytranslation } from './models/entities/ProductCategorytranslation';
import { ProductCollection } from './models/entities/ProductCollection';
import { ProductCollectionchannellisting } from './models/entities/ProductCollectionchannellisting';
import { ProductCollectionproduct } from './models/entities/ProductCollectionproduct';
import { ProductCollectiontranslation } from './models/entities/ProductCollectiontranslation';
import { ProductDigitalcontent } from './models/entities/ProductDigitalcontent';
import { ProductDigitalcontenturl } from './models/entities/ProductDigitalcontenturl';
import { ProductProduct } from './models/entities/ProductProduct';
import { ProductProductchannellisting } from './models/entities/ProductProductchannellisting';
import { ProductProductmedia } from './models/entities/ProductProductmedia';
import { ProductProducttranslation } from './models/entities/ProductProducttranslation';
import { ProductProducttype } from './models/entities/ProductProducttype';
import { ProductProductvariant } from './models/entities/ProductProductvariant';
import { ProductProductvariantchannellisting } from './models/entities/ProductProductvariantchannellisting';
import { ProductProductvarianttranslation } from './models/entities/ProductProductvarianttranslation';
import { ProductVariantchannellistingpromotionrule } from './models/entities/ProductVariantchannellistingpromotionrule';
import { ProductVariantmedia } from './models/entities/ProductVariantmedia';
import { SchedulersCustomperiodictask } from './models/entities/SchedulersCustomperiodictask';
import { SchedulersCustomschedule } from './models/entities/SchedulersCustomschedule';
import { ShippingShippingmethod } from './models/entities/ShippingShippingmethod';
import { ShippingShippingmethodExcludedProducts } from './models/entities/ShippingShippingmethodExcludedProducts';
import { ShippingShippingmethodchannellisting } from './models/entities/ShippingShippingmethodchannellisting';
import { ShippingShippingmethodpostalcoderule } from './models/entities/ShippingShippingmethodpostalcoderule';
import { ShippingShippingmethodtranslation } from './models/entities/ShippingShippingmethodtranslation';
import { ShippingShippingzone } from './models/entities/ShippingShippingzone';
import { ShippingShippingzoneChannels } from './models/entities/ShippingShippingzoneChannels';
import { SiteSitesettings } from './models/entities/SiteSitesettings';
import { SiteSitesettingstranslation } from './models/entities/SiteSitesettingstranslation';
import { TaxTaxclass } from './models/entities/TaxTaxclass';
import { TaxTaxclasscountryrate } from './models/entities/TaxTaxclasscountryrate';
import { TaxTaxconfiguration } from './models/entities/TaxTaxconfiguration';
import { TaxTaxconfigurationpercountry } from './models/entities/TaxTaxconfigurationpercountry';
import { ThumbnailThumbnail } from './models/entities/ThumbnailThumbnail';
import { User } from './models/entities/User';
import { WarehouseAllocation } from './models/entities/WarehouseAllocation';
import { WarehouseChannelwarehouse } from './models/entities/WarehouseChannelwarehouse';
import { WarehousePreorderallocation } from './models/entities/WarehousePreorderallocation';
import { WarehousePreorderreservation } from './models/entities/WarehousePreorderreservation';
import { WarehouseReservation } from './models/entities/WarehouseReservation';
import { WarehouseStock } from './models/entities/WarehouseStock';
import { WarehouseWarehouse } from './models/entities/WarehouseWarehouse';
import { WarehouseWarehouseShippingZones } from './models/entities/WarehouseWarehouseShippingZones';
import { WebhookWebhook } from './models/entities/WebhookWebhook';
import { WebhookWebhookevent } from './models/entities/WebhookWebhookevent';

export const entities = [
	DjangoCeleryBeatClockedschedule,
	DiscountCheckoutlinediscount,
	ProductProductvariantchannellisting,
	PluginsPluginconfiguration,
	AttributeAttributevariant,
	AttributeAttribute,
	DjangoMigrations,
	DiscountVouchertranslation,
	CheckoutCheckoutGiftCards,
	DiscountPromotionruleGifts,
	PermissionPermission,
	AttributeAssignedpageattributevalue,
	OrderFulfillment,
	DiscountOrderdiscount,
	AttributeAttributetranslation,
	DiscountCheckoutdiscount,
	AccountUserUserPermissions,
	AttributeAttributeproduct,
	AttributeAssignedvariantattribute,
	AppAppinstallation,
	ProductProduct,
	OrderOrderGiftCards,
	ProductCollectionproduct,
	AppApptoken,
	PagePage,
	TaxTaxclass,
	ProductProductvariant,
	ProductCollectionchannellisting,
	DiscountPromotionrule,
	ProductCategory,
	DiscountPromotionruletranslation,
	WarehouseReservation,
	TaxTaxclasscountryrate,
	ShippingShippingmethodpostalcoderule,
	DjangoCeleryBeatPeriodictasks,
	ProductVariantmedia,
	DiscountVouchercode,
	SiteSitesettingstranslation,
	GiftcardGiftcardevent,
	SchedulersCustomperiodictask,
	CheckoutCheckoutline,
	MenuMenu,
	ProductDigitalcontent,
	DiscountVoucherchannellisting,
	CoreEventdelivery,
	ProductProductchannellisting,
	ProductCollection,
	OrderOrder,
	ShippingShippingzone,
	AttributeAttributepage,
	AccountGroupChannels,
	InvoiceInvoice,
	CheckoutCheckoutmetadata,
	ProductProducttype,
	AccountCustomerevent,
	DiscountVoucherCollections,
	DiscountPromotiontranslation,
	DjangoCeleryBeatIntervalschedule,
	AppAppextensionPermissions,
	WarehouseChannelwarehouse,
	AccountAddress,
	ProductProductvarianttranslation,
	DiscountVoucher,
	TaxTaxconfiguration,
	DiscountVoucherVariants,
	PluginsEmailtemplate,
	AttributeAssignedproductattributevalue,
	ShippingShippingzoneChannels,
	GiftcardGiftcard,
	OrderOrderevent,
	WarehouseWarehouseShippingZones,
	WarehousePreorderallocation,
	AppAppextension,
	WarehousePreorderreservation,
	DjangoSite,
	AppAppinstallationPermissions,
	DiscountOrderlinediscount,
	DiscountPromotionevent,
	ProductCategorytranslation,
	SiteSitesettings,
	CheckoutCheckout,
	WebhookWebhookevent,
	CsvExportevent,
	AttributeAttributevalue,
	DiscountVoucherCategories,
	WebhookWebhook,
	ChannelChannel,
	AccountStaffnotificationrecipient,
	ProductVariantchannellistingpromotionrule,
	PaymentTransaction,
	AppAppPermissions,
	WarehouseWarehouse,
	PaymentTransactionitem,
	OrderOrderline,
	GiftcardGiftcardtag,
	CoreEventdeliveryattempt,
	AccountUserGroups,
	PaymentTransactionevent,
	DjangoCeleryBeatSolarschedule,
	AccountGroupPermissions,
	WarehouseAllocation,
	AttributeAttributevaluetranslation,
	PagePagetranslation,
	ThumbnailThumbnail,
	User,
	AccountUserAddresses,
	TaxTaxconfigurationpercountry,
	SchedulersCustomschedule,
	ProductDigitalcontenturl,
	DjangoCeleryBeatPeriodictask,
	DiscountPromotion,
	ShippingShippingmethod,
	ShippingShippingmethodchannellisting,
	InvoiceInvoiceevent,
	AppApp,
	MenuMenuitemtranslation,
	AccountCustomernote,
	AccountGroup,
	MenuMenuitem,
	AttributeAssignedvariantattributevalue,
	ProductCollectiontranslation,
	PagePagetype,
	PaymentPayment,
	CsvExportfile,
	OrderFulfillmentline,
	OrderOrdergrantedrefund,
	ShippingShippingmethodExcludedProducts,
	OrderOrdergrantedrefundline,
	ProductProducttranslation,
	DjangoCeleryBeatCrontabschedule,
	DjangoContentType,
	DiscountPromotionruleChannels,
	ProductProductmedia,
	WarehouseStock,
	DiscountVoucherProducts,
	GiftcardGiftcardTags,
	DiscountVouchercustomer,
	ShippingShippingmethodtranslation,
	DiscountPromotionruleVariants,
	CoreEventpayload,
	AccountUser,
];
