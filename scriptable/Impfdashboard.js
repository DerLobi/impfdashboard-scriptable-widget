// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: syringe;
// Impfdashboard Widget
//
// MIT License
//
// Copyright (c) 2021 Christian Lobach
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const localizedStrings = {
  'first.vaccinations': {
    de: 'Mindestens\nErstgeimpfte',
    en: 'At least first\nvaccinations',
  },
  'cumulative.doses': {
    de: 'Verabreichte\nImpfdosen',
    en: 'Administered\ndoses',
  },
  'fully.vaccinated': {
    de: 'Vollständig\nGeimpfte',
    en: 'Fully\nvaccinated',
  },

};

const widget = new ListWidget();
const { locale, language } = Device;
const horizontalPadding = 12;
const verticalPadding = 8;

config.widgetFamily ||= 'large';

const titleFont = Font.mediumSystemFont(config.widgetFamily == 'large' ? 12 : 10);
const valueFont = Font.mediumSystemFont(config.widgetFamily == 'large' ? 20 : 16);

const lightBlue = new Color('#9DCCE5');
const darkBlue = new Color('#3392C5');

const dateFormatter = new DateFormatter();
dateFormatter.dateFormat = 'E';

widget.setPadding(verticalPadding, horizontalPadding, verticalPadding, horizontalPadding);
widget.url = 'https://impfdashboard.de';


let data = await loadData();

const headerStack = widget.addStack();
const header = headerStack.addText('💉 Impfdashboard'.toUpperCase());
header.font = Font.mediumSystemFont(10);

widget.addSpacer(4);

buildLayout(widget);

Script.setWidget(widget);
Script.complete();
widget.presentLarge();

function buildLayout(widget) {
  const chart = createChart(data.dosesLastWeeks, config.widgetFamily);

  switch (config.widgetFamily) {
    case 'large':
      const largeOuterVStack = widget.addStack();
      largeOuterVStack.layoutVertically();
      largeOuterVStack.centerAlignContent();
      largeOuterVStack.addSpacer();
      const largeHStack = largeOuterVStack.addStack();
      largeHStack.setPadding(0, 16, 0, 16);
      createStack(largeHStack, data.firstVaccinations);
      largeHStack.addSpacer();
      createStack(largeHStack, data.dosesCumulative);
      largeHStack.addSpacer();
      createStack(largeHStack, data.fullVaccinations);
      largeOuterVStack.addSpacer();
      largeOuterVStack.addImage(chart).centerAlignImage();

      const largePadded = largeOuterVStack.addStack();
      largePadded.setPadding(16, 0, 16, 0);
      largePadded.addSpacer();
      createStack(largePadded, data.dosesToday, true, true);
      largePadded.addSpacer();

      break;
    case 'medium':
      const outerHStack = widget.addStack();

      const vStack = outerHStack.addStack();
      vStack.setPadding(verticalPadding, 0, verticalPadding, 0);
      vStack.layoutVertically();
      createStack(vStack, data.firstVaccinations);
      vStack.addSpacer(verticalPadding);
      createStack(vStack, data.fullVaccinations);
      outerHStack.addSpacer(horizontalPadding);
      const secondaryStack = outerHStack.addStack();
      secondaryStack.layoutVertically();

      secondaryStack.addImage(chart);
      secondaryStack.addSpacer();
      const mediumPadded = secondaryStack.addStack();
      mediumPadded.addSpacer();
      createStack(mediumPadded, data.dosesToday, true, true);
      mediumPadded.addSpacer();

      break;
    default:
      const outerVStack = widget.addStack();
      outerVStack.layoutVertically();
      outerVStack.centerAlignContent();
      const hStack = outerVStack.addStack();
      createStack(hStack, data.firstVaccinations);
      hStack.addSpacer();
      createStack(hStack, data.fullVaccinations);
      outerVStack.addImage(chart);

      const padded = outerVStack.addStack();
      padded.addSpacer();
      createStack(padded, data.dosesToday, true, true);
      padded.addSpacer();
      break;
  }
}

function createStack(superView, data, inverse = false, centerAlignText = false) {
  const vStack = superView.addStack();
  vStack.layoutVertically();
  if (centerAlignText) {
    vStack.centerAlignContent();
  }
  if (inverse == false) {
    const title = vStack.addText(data.title);
    title.font = titleFont;
    if (centerAlignText) {
      title.centerAlignText();
    }
  }
  const value = vStack.addText(data.stringValue);
  value.font = valueFont;
  value.textColor = darkBlue;
  if (centerAlignText) {
    value.centerAlignText();
  }
  if (inverse) {
    const title = vStack.addText(data.title);
    title.font = titleFont;
    if (centerAlignText) {
      title.centerAlignText();
    }
  }

  return vStack;
}

async function loadData() {
  const url = 'https://github.com/DerLobi/impfdashboard-scriptable-widget/raw/main/data/data.json';
  const request = new Request(url);
  const records = await request.loadJSON();

  const lastRecord = records[records.length - 1];

  const data = {
    firstVaccinations: {
      title: localized('first.vaccinations'),
      stringValue: lastRecord.impf_quote_erst.toLocaleString(locale, {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    },
    fullVaccinations: {
      title: localized('fully.vaccinated'),
      stringValue: lastRecord.impf_quote_voll.toLocaleString(locale, {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    },
    dosesCumulative: {
      title: localized('cumulative.doses'),
      stringValue: new Intl.NumberFormat(locale, { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 }).format(lastRecord.dosen_kumulativ),
    },
    dosesToday: {
      title: new Date(lastRecord.date).toLocaleString(locale, {
        weekday: 'long',
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
      }),
      stringValue: `+${lastRecord.dosen_differenz_zum_vortag.toLocaleString()}`,
    },
    dosesLastWeeks: records.map((record) => ({
      date: record.date,
      amount: record.dosen_differenz_zum_vortag,
    })),
  };

  return data;
}

function createChart(data, widgetFamily) {
  let size = new Size(400, 120);
  let dataSeries = data;

  switch (widgetFamily) {
    case 'large':
      size = new Size(800, 400);
      break;
    case 'medium':
      size = new Size(640, 240);
      dataSeries = data.slice(data.length - 7, data.length);
      break;
    default:
      dataSeries = data.slice(data.length - 7, data.length);
      break;
  }

  const ctx = new DrawContext();
  ctx.opaque = false;
  ctx.respectScreenScale = true;
  ctx.size = size;

  const sorted = [...dataSeries];
  sorted.sort((lhs, rhs) => rhs.amount - lhs.amount);
  const maximum = sorted[0].amount;

  const textHeight = 20;
  const availableHeight = size.height - textHeight;
  const spacing = 4;
  const barWidth = (size.width - ((dataSeries.length - 1) * spacing)) / dataSeries.length;

  ctx.setFont(Font.mediumSystemFont(18));
  ctx.setTextColor(Color.gray());
  ctx.setTextAlignedCenter();

  for (i = 0; i < dataSeries.length; i++) {
    const day = dataSeries[i];
    const path = new Path();
    const x = (i * spacing + i * barWidth);
    const value = day.amount;
    const heightFactor = value / maximum;
    const barHeight = heightFactor * availableHeight;
    const rect = new Rect(x, size.height - barHeight, barWidth, barHeight);
    path.addRoundedRect(rect, 4, 4);
    ctx.addPath(path);

    if (i == dataSeries.length - 1) {
      ctx.setFillColor(darkBlue);
    } else {
      ctx.setFillColor(lightBlue);
    }

    ctx.fillPath();

    const textRect = new Rect(x, size.height - barHeight - textHeight - 2, barWidth, textHeight);
    const date = new Date(day.date);
    const formattedDate = dateFormatter.string(date);

    ctx.drawTextInRect(dateFormatter.string(date), textRect);
  }

  const image = ctx.getImage();

  return image;
}

function localized(key) {
  if (localizedStrings[key] == null) {
    return key;
  }
  return localizedStrings[key][language()] || localizedStrings[key].en;
}
