const loadPromotions = require('./promotions');
const loadAllItems = require('./items');
var _ = require('lodash');

module.exports = function bestCharge(selectedItems) {
  let message = printHeader();

  let itemsInCart = groupByItem(selectedItems);
  _.forIn(itemsInCart, function (value, key) {
    generateItemObj(value, key);
  });

  let total = Object.values(itemsInCart).reduce((sum, item) => {
    sum += item.price * item.count;
    return sum;
  }, 0);

  _.forIn(itemsInCart, function (item) {
    message += printItem(item);
  });

  let savingSummary = getBestSaving(itemsInCart, total);

  if (savingSummary.saving > 0) {
    message += printLineBreak();
    message += printPromotionHeader();
    message += printPromotionMessage(savingSummary);
    total -= savingSummary.saving;
  }

  message += printLineBreak();
  message += printTotal(total);
  return message;
}

function getBestSaving(itemsInCart, total) {
  let promotions = loadPromotions();
  let savingMsg = "";
  let savingItemNames = [];

  let promoHalfPrice = _.find(promotions, ['type', '指定菜品半价']);
  let saving = promoHalfPrice.items.reduce((sum, cur) => {
      if (itemsInCart[cur]) {
        sum += (itemsInCart[cur].price / 2 * itemsInCart[cur].count);
        savingItemNames.push(itemsInCart[cur].name);
      }
      return sum;
    }, 0);
  if (savingItemNames.length > 0) {
    savingMsg = `指定菜品半价(${savingItemNames.join('，')})`
  }

  if (total >= 30 && saving < 6 ) {
    saving = 6;
    savingMsg = '满30减6元';
  }

  return {saving, savingMsg};
}

function groupByItem (inputs) {
  return inputs.reduce((acc, cur) => {
    let obj = parseInput(cur);
    acc[obj.id] = acc[obj.id] || {};
    acc[obj.id].count = (acc[obj.id].count || 0) + obj.count;
    return acc;
  }, {});
}

function parseInput(input) {
  const [id, count] = input.split(' x ');
  return {id: id.trim(), count: parseInt(count.trim())}
}

function generateItemObj(itemObj, id) {
  return Object.assign(itemObj, getItemDetails(id))
}

function getItemDetails(barcode) {
  let items = loadAllItems();

  let itemDetails = _.find(items, function (obj) {
    return obj.id===barcode;
  });

  return itemDetails;
}

function printHeader() {
  return `============= 订餐明细 =============\n`;
}

function printItem(itemObj) {
  return `${itemObj.name} x ${itemObj.count} = ${itemObj.price * itemObj.count}元\n`
}

function printPromotionHeader() {
  return "使用优惠:\n";
}

function printPromotionMessage(savingSummary) {
  return `${savingSummary.savingMsg}，省${savingSummary.saving}元\n`;
}
function printLineBreak() {
  return `-----------------------------------\n`;
}

function printTotal(total) {
  return `总计：${total}元\n===================================`;
}


