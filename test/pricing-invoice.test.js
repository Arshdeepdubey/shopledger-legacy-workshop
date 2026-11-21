'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const pricing = require('../lib/pricing');
const coupons = require('../lib/coupons');
const invoice = require('../lib/invoice');

test('CURRENT BEHAVIOUR: invoice matches checkout GST and totals for a billed HSN order', function () {
  const order = {
    id: 1001,
    subtotal: 640,
    discount: 0,
    tax: 32,
    total: 672,
    coupon: '',
    items: [
      { id: 1, name: 'Rice', sku: 'RICE-1', hsn: '1006', price: 640, qty: 1 }
    ]
  };
  const checkout = pricing.computeTotals(order.items, order.coupon);
  const printed = invoice.computeInvoiceFigures(order);

  assert.equal(printed.subtotal, order.subtotal);
  assert.equal(printed.discount, order.discount);
  assert.equal(printed.tax, order.tax);
  assert.equal(printed.total, order.total);
  assert.equal(printed.subtotal, checkout.subtotal);
  assert.equal(printed.discount, checkout.discount);
  assert.equal(printed.tax, checkout.tax);
  assert.equal(printed.cgst, checkout.cgst);
  assert.equal(printed.sgst, checkout.sgst);
  assert.equal(printed.total, checkout.total);
  assert.deepEqual(printed.rows.map(function (row) {
    return { gstPercent: row.gstPercent, line: row.line, lineTax: row.lineTax };
  }), checkout.lines.map(function (line) {
    return { gstPercent: line.gstPercent, line: line.gross, lineTax: line.tax };
  }));
  assert.equal(invoice.render(order).includes('Accountant Reconciliation Notice'), false);
});

test('CURRENT BEHAVIOUR: checkout applies HSN slab GST after coupon discount', function () {
  const items = [
    { id: 1, name: 'Rice', sku: 'RICE-1', hsn: '1006', price: 1000, qty: 1 }
  ];

  const totals = pricing.computeTotals(items, 'SAVE10');

  assert.deepEqual(totals, {
    subtotal: 1000,
    discount: 100,
    taxable: 900,
    tax: 45,
    cgst: 22.5,
    sgst: 22.5,
    total: 945,
    lines: [{
      id: 1,
      name: 'Rice',
      hsn: '1006',
      gstPercent: 5,
      gross: 1000,
      discount: 100,
      taxable: 900,
      tax: 45,
      net: 945
    }]
  });
});

test('CURRENT BEHAVIOUR: invoice uses the HSN slab and coupon discount from checkout', function () {
  const order = {
    id: 1001,
    coupon: 'SAVE10',
    items: [
      { id: 1, name: 'Rice', sku: 'RICE-1', hsn: '1006', price: 1000, qty: 1 }
    ]
  };

  const checkout = pricing.computeTotals(order.items, order.coupon);
  const printed = invoice.computeInvoiceFigures(order);

  assert.equal(checkout.tax, 45);
  assert.equal(checkout.total, 945);
  assert.equal(printed.rows[0].gstPercent, 5);
  assert.equal(printed.rows[0].lineTax, 45);
  assert.equal(printed.discount, 100);
  assert.equal(printed.total, 945);
});

test('CURRENT BEHAVIOUR: invoice retains checkout coupon minimum and maximum rules', function () {
  const belowMinimum = {
    coupon: 'SAVE10',
    items: [{ name: 'Rice', hsn: '1006', price: 100, qty: 1 }]
  };
  const aboveMaximum = {
    coupon: 'SAVE10',
    items: [{ name: 'Tea', hsn: '0902', price: 3000, qty: 1 }]
  };

  assert.equal(coupons.validate('SAVE10', 100).valid, false);
  assert.equal(invoice.computeInvoiceFigures(belowMinimum).discount, 0);
  assert.equal(invoice.computeInvoiceFigures(belowMinimum).total, 105);

  assert.equal(coupons.validate('SAVE10', 3000).discount, 150);
  assert.equal(invoice.computeInvoiceFigures(aboveMaximum).discount, 150);
  assert.equal(invoice.computeInvoiceFigures(aboveMaximum).total, pricing.computeTotals(aboveMaximum.items, 'SAVE10').total);
});

test('CURRENT BEHAVIOUR: invoice does not apply an inactive coupon rejected by checkout', function () {
  const order = {
    coupon: 'DIWALI20',
    items: [{ name: 'Tea', hsn: '0902', price: 1000, qty: 1 }]
  };

  assert.equal(coupons.validate('DIWALI20', 1000).valid, false);
  assert.equal(invoice.computeInvoiceFigures(order).discount, 0);
  assert.equal(invoice.computeInvoiceFigures(order).total, 1180);
});

test('CURRENT BEHAVIOUR: invoice line GST uses post-discount taxable value', function () {
  const order = {
    coupon: 'SAVE10',
    items: [{ name: 'Tea', hsn: '0902', price: 1000, qty: 1 }]
  };

  const checkout = pricing.computeTotals(order.items, order.coupon);
  const printed = invoice.computeInvoiceFigures(order);

  assert.equal(checkout.lines[0].taxable, 900);
  assert.equal(checkout.lines[0].tax, 162);
  assert.equal(printed.rows[0].lineTax, 162);
  assert.equal(printed.rows[0].line, 1000);
  assert.equal(Object.hasOwn(printed.rows[0], 'discount'), false);
});
