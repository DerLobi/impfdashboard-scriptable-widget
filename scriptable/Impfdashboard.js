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

const titleFont = Font.mediumSystemFont( config.widgetFamily == "large" ? 16 : 10 )
const valueFont = Font.mediumSystemFont( config.widgetFamily == "large" ? 22 : 16 )

const lightBlue = new Color('#9DCCE5')
const darkBlue = new Color('#3392C5')

const dateFormatter = new DateFormatter()
dateFormatter.dateFormat = 'E'

widget.setPadding(verticalPadding, horizontalPadding, verticalPadding, horizontalPadding);
widget.url = 'https://impfdashboard.de';

config.widgetFamily ||= 'small'
let data = await loadData();

const headerStack = widget.addStack();
const header = headerStack.addText('💉 Impfdashboard'.toUpperCase());
header.font = Font.mediumSystemFont(10);

widget.addSpacer(4);

buildLayout(widget)

Script.setWidget(widget);
Script.complete();
widget.presentSmall();

function buildLayout(widget) {

  let chart = createChart(data.dosesLastWeeks, config.widgetFamily);

  switch(config.widgetFamily) {
    case 'large':
      
      break;
    case 'medium':
      const outerHStack = widget.addStack();
      const vStack = outerHStack.addStack();
      vStack.layoutVertically();
      createStack(vStack, data.firstVaccinations);
      vStack.addSpacer();
      createStack(vStack, data.fullVaccinations);
      const secondaryStack = outerHStack.addStack();
      secondaryStack.layoutVertically();
  
      secondaryStack.addImage(chart);
      // image.centerAlignImage()      
      const mediumPadded = outerVStack.addStack();
      mediumPadded.addSpacer();
      createStack(mediumPadded, data.dosesToday, true, true);
      mediumPadded.addSpacer();
  
      break;
    default:
      const outerVStack = widget.addStack()
      outerVStack.layoutVertically();
      outerVStack.centerAlignContent();      
      const hStack = outerVStack.addStack();      
      createStack(hStack, data.firstVaccinations);
      hStack.addSpacer();
      createStack(hStack, data.fullVaccinations);
      outerVStack.addImage(chart);
      // image.centerAlignImage()      
      const padded = outerVStack.addStack();
      padded.addSpacer();
      createStack(padded, data.dosesToday, true, true);
      padded.addSpacer();
      break;
  }
}

function createStack(superView, data, inverse = false, centerAlignText = false) {
  let vStack = superView.addStack();
  vStack.layoutVertically();
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
    value.centerAlignText()
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
    dosesLastWeeks: records.map( record => {
      return { 
        date: record.date,
        dosen_differenz_zum_vortag: record.dosen_differenz_zum_vortag 
      } 
    })
  };

  return data;
}

function createChart(data, widgetFamily) {
  
  let size = new Size(400, 120);
  let dataSeries = data

  switch(widgetFamily) {
    case 'large':
      size = new Size(800, 240)
    case 'medium':
      size = new Size(400, 240);
      dataSeries = data.slice(data.length - 7, data.length);
    default:
      dataSeries = data.slice(data.length - 7, data.length);
      break;
  }

  const ctx = new DrawContext();
  ctx.opaque = false;
  ctx.respectScreenScale = true;
  ctx.size = size;

  let sorted = [...dataSeries];  
  sorted.sort(function (lhs, rhs) {
    return rhs.dosen_differenz_zum_vortag - lhs.dosen_differenz_zum_vortag;
  }); 
  const maximum = sorted[0].dosen_differenz_zum_vortag;

  const textHeight = 20
  const availableHeight = size.height - textHeight
  const spacing = 4;
  const barWidth = (size.width - ((dataSeries.length - 1) * spacing)) / dataSeries.length;

  ctx.setFont(Font.mediumSystemFont(18))
  ctx.setTextColor(Color.gray())
  ctx.setTextAlignedCenter()
  
  for (i = 0; i < dataSeries.length; i++) { 
    let day = dataSeries[i]    
    let path = new Path()
    let x = (i * spacing + i * barWidth )
    let value = day.dosen_differenz_zum_vortag;
    let heightFactor = value / maximum
    let barHeight = heightFactor * availableHeight    
    let rect = new Rect(x, size.height - barHeight, barWidth, barHeight)    
    path.addRoundedRect(rect, 4, 4)
    ctx.addPath(path)

    if(i == dataSeries.length -1) {
      ctx.setFillColor(darkBlue)
    } else {
      ctx.setFillColor(lightBlue)
    }

    ctx.fillPath()

    let textRect = new Rect(x, size.height - barHeight - textHeight - 2, barWidth, textHeight)
    let date = new Date(day.date)    
    let formattedDate = dateFormatter.string(date)

    ctx.drawTextInRect(dateFormatter.string(date), textRect)
  }

  let image = ctx.getImage();
  return image;
}
