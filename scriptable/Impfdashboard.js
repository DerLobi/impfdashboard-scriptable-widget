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

const widget = new ListWidget();
const { locale } = Device;
const horizontalPadding = 12;
const verticalPadding = 8;
widget.setPadding(verticalPadding, 0, verticalPadding, 0);
widget.url = 'https://impfdashboard.de';

let data = await loadData();
let chart = await loadChart();

const headerStack = widget.addStack();
headerStack.setPadding(0, horizontalPadding, 0, horizontalPadding);
const header = headerStack.addText('💉 Impfdashboard'.toUpperCase());
header.font = Font.mediumSystemFont(10);

widget.addSpacer(4);

const hStack = widget.addStack();
hStack.setPadding(0, horizontalPadding, 0, horizontalPadding);
hStack.layoutHorizontally();

const firstStack = hStack.addStack();
firstStack.layoutVertically();
const firstTitle = firstStack.addText(data.firstVaccinations.title);
firstTitle.font = Font.mediumSystemFont(10);
const firstValue = firstStack.addText(data.firstVaccinations.stringValue);
firstValue.font = Font.mediumSystemFont(16);
firstValue.textColor = new Color('#3392C5');

hStack.addSpacer();

const fullStack = hStack.addStack();
fullStack.layoutVertically();
const fullTitle = fullStack.addText(data.fullVaccinations.title);
fullTitle.font = Font.mediumSystemFont(10);
const fullValue = fullStack.addText(data.fullVaccinations.stringValue);
fullValue.font = Font.mediumSystemFont(16);
fullValue.textColor = new Color('#3392C5');

widget.addImage(chart).centerAlignImage();

const todayValue = widget.addText(data.dosesToday.stringValue);
todayValue.centerAlignText();
todayValue.font = Font.mediumSystemFont(16);
todayValue.textColor = new Color('#3392C5');
const todayTitle = widget.addText(data.dosesToday.title);
todayTitle.centerAlignText();
todayTitle.font = Font.mediumSystemFont(10);

Script.setWidget(widget);
Script.complete();
widget.presentSmall();

async function loadData() {
  const url = 'https://github.com/DerLobi/impfdashboard-scriptable-widget/raw/main/data/data.json';
  const request = new Request(url);
  const records = await request.loadJSON();

  const lastRecord = records[records.length - 1];

  const data = {
    firstVaccinations: {
      title: 'Mindestens\nErstgeimpfte',
      stringValue: lastRecord.impf_quote_erst.toLocaleString(locale, {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    },
    fullVaccinations: {
      title: 'Vollständig\nGeimpfte',
      stringValue: lastRecord.impf_quote_voll.toLocaleString(locale, {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    },
    dosesToday: {
      title: new Date(lastRecord.date).toLocaleString(locale, {
        weekday: 'long',
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
      }),
      stringValue: `+${lastRecord.dosen_differenz_zum_vortag.toLocaleString()}`,
    },
  };

  return data;
}

async function loadChart() {
  const url = 'https://github.com/DerLobi/impfdashboard-scriptable-widget/raw/main/data/barChart.png';
  const request = new Request(url);
  const image = await request.loadImage();
  return image;
}
