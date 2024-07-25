import { d as derived, w as writable } from "./index3.js";
import "./index2.js";
var AttributeInputTypeEnum = /* @__PURE__ */ ((AttributeInputTypeEnum2) => {
  AttributeInputTypeEnum2["Boolean"] = "BOOLEAN";
  AttributeInputTypeEnum2["Date"] = "DATE";
  AttributeInputTypeEnum2["DateTime"] = "DATE_TIME";
  AttributeInputTypeEnum2["Dropdown"] = "DROPDOWN";
  AttributeInputTypeEnum2["File"] = "FILE";
  AttributeInputTypeEnum2["Multiselect"] = "MULTISELECT";
  AttributeInputTypeEnum2["Numeric"] = "NUMERIC";
  AttributeInputTypeEnum2["PlainText"] = "PLAIN_TEXT";
  AttributeInputTypeEnum2["Reference"] = "REFERENCE";
  AttributeInputTypeEnum2["RichText"] = "RICH_TEXT";
  AttributeInputTypeEnum2["Swatch"] = "SWATCH";
  return AttributeInputTypeEnum2;
})(AttributeInputTypeEnum || {});
const randomID = () => "_" + Math.random().toString(36).substring(2, 9);
const formatMoney = (currency, startAmount, endAmount) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  });
  if (endAmount) {
    return formatter.formatRange(startAmount, endAmount);
  }
  return formatter.format(startAmount);
};
const formatSelectedAttributeValue = (attribute) => {
  if (!attribute.attribute.inputType) {
    return "";
  }
  switch (attribute.attribute.inputType) {
    case AttributeInputTypeEnum.Dropdown:
      return attribute.values[0].name;
    case AttributeInputTypeEnum.Boolean:
      return attribute.values[0].boolean ? $t("common.yesIcon") : $t("common.noIcon");
    case AttributeInputTypeEnum.PlainText:
      return attribute.values[0].name;
    case AttributeInputTypeEnum.Multiselect:
      return attribute.values.join(", ");
    default:
      return attribute.values[0].value;
  }
};
function createNotificationStore() {
  const _notifications = writable([]);
  function send({ message, variant, timeout = 3e3 }) {
    _notifications.update((toasts) => {
      return toasts.concat({
        id: randomID(),
        message,
        variant,
        timeout
      });
    });
  }
  const { subscribe } = derived(_notifications, ($_notifications, set) => {
    set($_notifications);
    if ($_notifications.length) {
      const timer = setTimeout(() => {
        _notifications.update((toasts) => {
          toasts.shift();
          return toasts;
        });
      }, $_notifications[0].timeout);
      return () => clearTimeout(timer);
    }
  });
  return {
    subscribe,
    send
  };
}
const toastStore = createNotificationStore();
export {
  formatSelectedAttributeValue as a,
  formatMoney as f,
  toastStore as t
};
