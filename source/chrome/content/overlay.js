/* ***** BEGIN LICENSE BLOCK *****

 Copyright (c) 2006-2013  Jason Adams <imagezoom@yellowgorilla.net>
 Pale Moon Update:  2020  Andrew Sachen <webmaster@RealityRipple.com>

 This file is part of Image Zoom (now BIZARRE).

 Image Zoom is free software; you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation; either version 2 of the License, or
 (at your option) any later version.

 Image Zoom is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Image Zoom; if not, write to the Free Software
 Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA

 * ***** END LICENSE BLOCK ***** */

var bizarre =
{
 _Prefs: Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('extensions.bizarre.'),
 _context: null,
 _contextDisabled: false,
 _contextSubMenuLabel: null,
 _contextRotateMenuLabel: null,
 rotateTime: 0,
 _tmpImg: null,
 _linuxImg: null,
 _curImg: null,
 _scrollZooming: false,
 _haveZoomed: false,
 init: function()
 {
  if (document.getElementById('contentAreaContextMenu'))
   document.getElementById('contentAreaContextMenu').addEventListener('popupshowing', bizarre.showMenu, false);
  window.addEventListener('mousedown', bizarre.izOnMouseDown, true);
 },
 izShowCustomZoom: function()
 {
  let oizImage = new zarImage(document.popupNode);
  openDialog('chrome://bizarre/content/customzoom.xul', '', 'chrome,modal,centerscreen', 'Image', oizImage);
  bizarre._reportStatus(oizImage);
 },
 izShowCustomDim: function()
 {
  let oizImage = new zarImage(document.popupNode);
  openDialog('chrome://bizarre/content/customdim.xul', '', 'chrome,modal,centerscreen', oizImage);
  bizarre._reportStatus(oizImage);
 },
 izImageFit: function()
 {
  let oizImage = new zarImage(document.popupNode);
  oizImage.fit(bizarre._Prefs.getBoolPref('autocenter'));
  bizarre._reportStatus(oizImage);
 },
 izFitWidth: function()
 {
  let oizImage = new zarImage(document.popupNode);
  oizImage.fit(bizarre._Prefs.getBoolPref('autocenter'), true);
  bizarre._reportStatus(oizImage);
 },
 izZoomIn: function()
 {
  let oizImage = new zarImage(document.popupNode);
  oizImage.zoom(bizarre._Prefs.getIntPref('zoomvalue') / 100);
  bizarre._reportStatus(oizImage);
 },
 izZoomOut: function()
 {
  let oizImage = new zarImage(document.popupNode);
  oizImage.zoom(100 / bizarre._Prefs.getIntPref('zoomvalue'));
  bizarre._reportStatus(oizImage);
 },
 izSetZoom: function(zFactor)
 {
  let oizImage = new zarImage(document.popupNode);
  oizImage.setZoom(zFactor);
  bizarre._reportStatus(oizImage);
 },
 izRotateRight: function()
 {
  let oizImage = new zarImage(document.popupNode);
  oizImage.rotate(90);
  bizarre._tmpImg = oizImage;
 },
 izRotateLeft: function()
 {
  let oizImage = new zarImage(document.popupNode);
  oizImage.rotate(-90);
  bizarre._tmpImg = oizImage;
 },
 izRotate180: function()
 {
  let oizImage = new zarImage(document.popupNode);
  oizImage.rotate(180);
  bizarre._tmpImg = oizImage;
 },
 izFlipH: function()
 {
  let oizImage = new zarImage(document.popupNode);
  oizImage.rotate(undefined, 'h');
  bizarre._tmpImg = oizImage;
 },
 izFlipV: function()
 {
  let oizImage = new zarImage(document.popupNode);
  oizImage.rotate(undefined, 'v');
  bizarre._tmpImg = oizImage;
 },
 izRotateReset: function()
 {
  let oizImage = new zarImage(document.popupNode);
  oizImage.resetFlip();
  oizImage.rotate(0 - oizImage.getAngle());
  bizarre._tmpImg = oizImage;
 },
 _getContextSubMenuLabel: function()
 {
  if (bizarre._contextSubMenuLabel === null)
   bizarre._contextSubMenuLabel = document.getElementById('context-zoomsub').getAttribute('label') + ' (%zoom% %)';
  return bizarre._contextSubMenuLabel;
 },
 _getContextRotateMenuLabel: function()
 {
  if (bizarre._contextRotateMenuLabel === null)
    bizarre._contextRotateMenuLabel = document.getElementById('context-rotatesub').getAttribute('label') + ' (%rotate%\u00B0)';
  return bizarre._contextRotateMenuLabel;
 },
 _cancelScrollZoom: function()
 {
  bizarre._linuxImg = null;
  bizarre._curImg = null;
  bizarre._scrollZooming = false;
  window.removeEventListener('wheel', bizarre.scrollImage, true);
  window.removeEventListener('mouseup', bizarre.izOnMouseUp, true);
 },
 _reportStatus(oizImage)
 {
  if (!bizarre._Prefs.getBoolPref('showStatus'))
   return;
  let locale = document.getElementById('bizarre.stringbundle');
  let statusTextFld = document.getElementById('statusbar-display');
  let tmpStatus = 'Image Zoom: ' + oizImage.zoomFactor() + '% | ' + locale.getString('widthLabel') + ': ' + oizImage.getWidth() + 'px | ' + locale.getString('heightLabel') + ': ' + oizImage.getHeight() + 'px';
  let sFlip = '';
  switch (oizImage.getFlip())
  {
   case 'H+V':
    sFlip = ' (Flipped Horizontally and Vertically)'
    break;
   case 'H':
    sFlip = ' (Flipped Horizontally)'
    break;
   case 'V':
    sFlip = ' (Flipped Vertically)'
    break;
  }
  tmpStatus = tmpStatus + ' | ' + locale.getString('rotateLabel') + ': ' + oizImage.getAngle() + '\u00B0' + sFlip;
  statusTextFld.label = tmpStatus;
 },
 callBackStatus: function()
 {
  if (bizarre._tmpImg === null)
   return;
  bizarre._reportStatus(bizarre._tmpImg);
  bizarre._tmpImg = null;
 },
 disableContextMenu: function(evt)
 {
  if (document.popupNode.tagName.toLowerCase() === 'img' || document.popupNode.tagName.toLowerCase() === 'canvas')
  {
   bizarre._linuxImg = document.popupNode;
   bizarre._context = evt.originalTarget;
   evt.preventDefault();
   bizarre._contextDisabled = true;
  }
  removeEventListener('popupshowing', bizarre.disableContextMenu, true);
 },
 izOnMouseDown: function(evt)
 {
  let targetName = evt.originalTarget.tagName.toLowerCase();
  if ((targetName === 'img' || targetName === 'canvas') && (bizarre._scrollZooming) && ((evt.which === bizarre._Prefs.getIntPref('imageresetbutton')) || (evt.which === bizarre._Prefs.getIntPref('imagefitbutton')) || (evt.which === bizarre._Prefs.getIntPref('triggerbutton'))))
  {
   evt.preventDefault();
   evt.stopPropagation();
  }
  if (!((evt.which === bizarre._Prefs.getIntPref('triggerbutton')) && (bizarre._Prefs.getBoolPref('usescroll')) && ((targetName === 'img' || targetName === 'canvas')) && !(targetName === 'embed' || targetName === 'object')))
   return;
  if (navigator.platform !== 'Win32' && navigator.platform !== 'Win64' && navigator.platform !== 'OS/2')
   addEventListener('popupshowing', bizarre.disableContextMenu, true);
  bizarre._haveZoomed = false;
  window.addEventListener('wheel', bizarre.handleWheelEvent, true);
  window.addEventListener('mouseup', bizarre.izOnMouseUp, true);
  window.addEventListener('click', bizarre.izOnMouseClick, true);
  bizarre._scrollZooming = true;
  bizarre._curImg = evt.originalTarget;
 },
 izOnMouseUp: function(evt)
 {
  if (evt.which !== bizarre._Prefs.getIntPref('triggerbutton'))
   return;
  if (bizarre._haveZoomed)
   evt.preventDefault();
  bizarre._cancelScrollZoom();
 },
 izOnMouseClick: function(evt)
 {
  if (evt.originalTarget === null)
   return;
  let targetName = evt.originalTarget.tagName.toLowerCase();
  if (evt.which === bizarre._Prefs.getIntPref('triggerbutton'))
  {
   if (bizarre._haveZoomed)
   {
    evt.preventDefault();
    evt.stopPropagation();
   }
   else
   {
    if (bizarre._contextDisabled)
    {
     document.popupNode = evt.originalTarget;
     try
     {
      bizarre._context.showPopup(null, evt.screenX, evt.screenY, 'context', 'bottomleft', 'topleft');
     }
     catch(e) {}
    }
   }
   bizarre._cancelScrollZoom();
   bizarre._haveZoomed = false;
   window.removeEventListener('click', bizarre.izOnMouseClick, true);
  }
  bizarre._contextDisabled = false;
  if (!bizarre._scrollZooming)
   return;
  if (targetName !== 'img' && targetName !== 'canvas')
  {
   window.removeEventListener('click', bizarre.izOnMouseClick, true);
   return;
  }
  switch (evt.which)
  {
   case bizarre._Prefs.getIntPref('imageresetbutton'):
    evt.preventDefault();
    evt.stopPropagation();
    bizarre._haveZoomed = true;
    let imgReset = new zarImage(evt.originalTarget);
    let rotateKeys = bizarre._Prefs.getIntPref('rotateKeys');
    if (rotateKeys && bizarre._modifierKeys(evt) === rotateKeys)
    {
     imgReset.resetFlip();
     imgReset.rotate(0 - imgReset.getAngle());
    }
    else
    {
     if (bizarre._Prefs.getBoolPref('toggleFitReset') && imgReset.zoomFactor() === 100)
      imgReset.fit(bizarre._Prefs.getBoolPref('autocenter'));
     else if(imgReset.zoomFactor() !== 100)
      imgReset.setZoom(100);
     else if(targetName === 'img')
     {
      let img = evt.originalTarget;
      imgReset.setDimension(img.naturalWidth, img.naturalHeight);
     }
    }
    bizarre._reportStatus(imgReset);
    break;
   case bizarre._Prefs.getIntPref('imagefitbutton'):
    evt.preventDefault();
    evt.stopPropagation();
    bizarre._haveZoomed = true;
    let imgFit = new zarImage(evt.originalTarget);
    if (bizarre._Prefs.getBoolPref('toggleFitReset') && imgFit.isFitted())
     imgFit.setZoom(100);
    else
     imgFit.fit(bizarre._Prefs.getBoolPref('autocenter'));
    bizarre._reportStatus(imgFit);
    break;
  }
 },
 handleWheelEvent: function(evt)
 {
  if (!((bizarre._scrollZooming) && (bizarre._curImg) && (bizarre._Prefs.getBoolPref('usescroll'))))
   return;
  evt.preventDefault();
  let scrollAmount;
  if (Math.abs(evt.deltaY) > Math.abs(evt.deltaX))
   scrollAmount = evt.deltaY;
  else
   scrollAmount = evt.deltaX;
  bizarre.scrollImage(scrollAmount, evt);
 },
 _modifierKeys: function(evt)
 {
  return evt.ctrlKey + evt.altKey * 2 + evt.shiftKey * 4;
 },
 scrollImage: function(wheelIncrement, evt)
 {
  let imgToScroll = bizarre._curImg;
  if (imgToScroll === null)
  {
   bizarre._cancelScrollZoom();
   return;
  }
  bizarre._haveZoomed = true;
  let oizImage = new zarImage(imgToScroll);
  let rotateKeys = bizarre._Prefs.getIntPref('rotateKeys');
  if (rotateKeys && bizarre._modifierKeys(evt) === rotateKeys)
  {
   oizImage.rotate(bizarre._Prefs.getIntPref('rotateValue') * (wheelIncrement > 0 ? 1 : -1));
   return;
  }
  let zoomFactor;
  if (bizarre._Prefs.getIntPref('scrollmode') === 0)
  {
   if (((wheelIncrement < 0) && !bizarre._Prefs.getBoolPref('reversescrollzoom')) || ((wheelIncrement > 0) && bizarre._Prefs.getBoolPref('reversescrollzoom')))
    zoomFactor = 1 / (1 + (bizarre._Prefs.getIntPref('scrollvalue') / 100));
   else
    zoomFactor = 1 + (bizarre._Prefs.getIntPref('scrollvalue') / 100);
   oizImage.zoom(zoomFactor);
  }
  else
  {
   if (((wheelIncrement < 0) && !bizarre._Prefs.getBoolPref('reversescrollzoom')) || ((wheelIncrement > 0) && bizarre._Prefs.getBoolPref('reversescrollzoom')))
    zoomFactor = oizImage.zoomFactor() - bizarre._Prefs.getIntPref('scrollvalue');
   else
    zoomFactor = oizImage.zoomFactor() + bizarre._Prefs.getIntPref('scrollvalue');
   oizImage.setZoom(zoomFactor);
  }
  bizarre._reportStatus(oizImage);
 },
 _insertSeparator: function(list, position)
 {
  for (let i = position - 1; i >= 0; i--)
  {
   if(list[i].hidden)
    continue;
   if (list[i].tagName === 'menuseparator')
    return false;
   break;
  }
  for (let i = position + 1; i < list.length; i++)
  {
   if(list[i].hidden)
    continue;
   if (list[i].tagName === 'menuseparator')
    return false;
   return true;
  }
  return false;
 },
 showMenu: function()
 {
  if (gContextMenu === null)
   return;
  let menuItems = new Array('context-zoom-zin', 'context-zoom-zout', 'context-zoom-zreset', 'context-zoom-zcustom', 'context-zoom-dcustom', 'context-zoom-fit', 'context-zoom-fitwidth', 'context-zoom-rotate-right', 'context-zoom-rotate-left', 'context-zoom-rotate-180', 'context-zoom-flip-h', 'context-zoom-flip-v', 'context-zoom-rotate-reset', 'zoomsub-zin', 'zoomsub-zout', 'zoomsub-zreset', 'rotatesub-rotate-right', 'rotatesub-rotate-left', 'rotatesub-rotate-180', 'rotatesub-flip-h', 'rotatesub-flip-v', 'rotatesub-rotate-reset', 'zoomsub-zcustom', 'zoomsub-dcustom', 'zoomsub-fit', 'zoomsub-fitwidth', 'zoomsub-z400', 'zoomsub-z200', 'zoomsub-z150', 'zoomsub-z125', 'zoomsub-z100', 'zoomsub-z75', 'zoomsub-z50', 'zoomsub-z25', 'zoomsub-z10');
  let optionItems = new Array('mmZoomIO', 'mmZoomIO', 'mmReset', 'mmCustomZoom', 'mmCustomDim', 'mmFitWindow', 'mmFitWidth', 'mmRotateRight', 'mmRotateLeft', 'mmRotate180', 'mmFlipH', 'mmFlipV', 'mmRotateReset', 'smZoomIO', 'smZoomIO', 'smReset', 'smRotateRight', 'smRotateLeft', 'smRotate180', 'smFlipH', 'smFlipV', 'smRotateReset', 'smCustomZoom', 'smCustomDim', 'smFitWindow', 'smFitWidth', 'smZoomPcts', 'smZoomPcts', 'smZoomPcts', 'smZoomPcts', 'smZoomPcts', 'smZoomPcts', 'smZoomPcts', 'smZoomPcts', 'smZoomPcts');
  let oizImage = null;
  if (gContextMenu.onImage || gContextMenu.onCanvas)
   oizImage = new zarImage(document.popupNode);
  for (let i = 0; i < menuItems.length; i++)
  {
   document.getElementById(menuItems[i]).setAttribute('hidden', ((!gContextMenu.onImage && !gContextMenu.onCanvas) || !bizarre._Prefs.getBoolPref(optionItems[i])).toString());
  }
  let subPopUp = document.getElementById('zoompopup');
  let subItems = subPopUp.getElementsByTagName('*');
  for (let i = 0; i < subItems.length; i++)
  {
   if (subItems[i].tagName === 'menuseparator')
    subItems[i].setAttribute('hidden', (!bizarre._insertSeparator(subItems, i)).toString());
  }
  if (subPopUp.getElementsByAttribute('hidden', false).length > 0)
  {
   let mnuZoom = document.getElementById('context-zoomsub');
   mnuZoom.setAttribute('label', bizarre._getContextSubMenuLabel().replace(/%zoom%/, oizImage.zoomFactor()));
   mnuZoom.setAttribute('hidden', 'false');
  }
  else
   document.getElementById('context-zoomsub').hidden = true;
  let rotatePopUp = document.getElementById('rotatepopup');
  if (rotatePopUp.getElementsByAttribute('hidden', false).length > 0)
  {
   let mnuRotate = document.getElementById('context-rotatesub');
   mnuRotate.setAttribute('label', bizarre._getContextRotateMenuLabel().replace(/%rotate%/, +oizImage.getAngle()));
   mnuRotate.setAttribute('hidden', 'false');
  }
  else
   document.getElementById('context-rotatesub').hidden = true;
 }
};

function zarImage(oImage)
{
 let pImage = oImage;
 let enabled = false;
 if ((pImage.naturalWidth !== 0) || (pImage.naturalHeight !== 0) || (pImage.style.width !== '') || (pImage.style.height !== '') || ((pImage.getAttribute('width')) && (pImage.getAttribute('height'))))
 {
  if (!(pImage.originalPxWidth) || (!pImage.style.width && !pImage.style.height))
  {
   pImage.originalPxWidth = pImage.width;
   pImage.originalPxHeight = pImage.height;
   if (!pImage.style.width && !pImage.style.height)
   {
    pImage.originalWidth = pImage.width;
    pImage.originalWidthUnit = 'px';
    pImage.originalHeight = pImage.height;
    pImage.originalHeightUnit = 'px';
    pImage.style.width = pImage.originalWidth + pImage.originalWidthUnit;
    pImage.style.height = pImage.originalHeight + pImage.originalHeightUnit;
   }
   else
   {
    if (pImage.style.width)
    {
     pImage.originalWidth = getDimInt(pImage.style.width);
     pImage.originalWidthUnit = getDimUnit(pImage.style.width);
     pImage.style.width = pImage.originalWidth + pImage.originalWidthUnit;
    }
    if (pImage.style.height)
    {
     pImage.originalHeight = getDimInt(pImage.style.height);
     pImage.originalHeightUnit = getDimUnit(pImage.style.height);
     pImage.style.height = pImage.originalHeight + pImage.originalHeightUnit;
    }
   }
   pImage.zoomFactor = 100;
   pImage.autoFitBefore = 0;
   pImage.angle = 0;
   pImage.hFlip = false;
   pImage.vFlip = false;
  }
  enabled = true;
 }
 this.getWidth = getWidth;
 this.getAngle = getAngle;
 this.getFlip = getFlip;
 this.resetFlip = resetFlip;
 this.getHeight = getHeight;
 this.setZoom = setZoom;
 this.setDimension = setDimension;
 this.zoom = zoom;
 this.fit = fit;
 this.rotate = rotate;
 this.zoomFactor = zoomFactor;
 this.isFitted = isFitted;
 function getWidth()
 {
  return pImage.width;
 }
 function getHeight()
 {
  return pImage.height;
 }
 function getAngle()
 {
  return pImage.angle;
 }
 function getFlip()
 {
  if (pImage.hFlip === true && pImage.vFlip === true)
   return 'H+V';
  if (pImage.hFlip === true)
   return 'H';
  if (pImage.vFlip === true)
   return 'V';
  return '';
 }
 function resetFlip()
 {
  pImage.hFlip = false;
  pImage.vFlip = false;
 }
 function setZoom(factor)
 {
  if (!((factor > 0) && (enabled)))
   return;
  pImage.zoomFactor = factor;
  pImage.autoFitBefore = 0;
  pZoomAbs();
 }
 function setDimension(width, height)
 {
  if (!enabled)
   return;
  pImage.style.width = width + 'px';
  pImage.style.height = height + 'px';
  pImage.zoomFactor = (pImage.width / pImage.originalPxWidth) * 100;
 }
 function zoom(factor)
 {
  if (!enabled)
   return;
  pImage.zoomFactor = pImage.zoomFactor * factor;
  pImage.autoFitBefore = 0;
  if (pImage.style.width)
  {
   let origWidth = getDimInt(pImage.style.width);
   pImage.style.width = (origWidth * factor) + getDimUnit(pImage.style.width);
  }
  if (pImage.style.height)
  {
   let origHeight = getDimInt(pImage.style.height);
   pImage.style.height = (origHeight * factor) + getDimUnit(pImage.style.height);
  }
 }
 function rotate(degrees, direction)
 {
  if (new Date().getTime() - bizarre.rotateTime < 200)
   return;
  bizarre.rotateTime = new Date().getTime();
  if (!pImage.originalData)
  {
   pImage.originalData = {
    src: pImage.tagName.toLowerCase() === 'canvas' ? pImage.getDataUrl() : pImage.src,
    naturalWidth: pImage.naturalWidth,
    naturalHeight: pImage.naturalHeight,
    originalPxWidth: pImage.originalPxWidth,
    originalPxHeight: pImage.originalPxHeight,
    originalWidth: pImage.originalWidth,
    originalHeight: pImage.originalHeight
   };
  }
  let origData = pImage.originalData;
  if (typeof degrees === 'undefined')
   degrees = 0;
  if (degrees < 0)
   degrees = (pImage.angle + 360 + (degrees % 360)) % 360;
  else
   degrees = (pImage.angle + degrees) % 360;
  if (typeof direction !== 'undefined')
  {
   if (direction === 'h')
    pImage.hFlip = !pImage.hFlip;
   else
    pImage.vFlip = !pImage.vFlip;
  }
  let theta;
  if (degrees >= 0)
   theta = (Math.PI * degrees) / 180;
  else
   theta = (Math.PI * (360 + degrees)) / 180;
  let costheta = Math.abs(Math.cos(theta));
  let sintheta = Math.abs(Math.sin(theta));
  let canvas = pImage.ownerDocument.createElement('canvas');
  canvas.width = costheta * origData.naturalWidth + sintheta * origData.naturalHeight;
  canvas.height = costheta * origData.naturalHeight + sintheta * origData.naturalWidth;
  canvas.oImage = new Image();
  canvas.oImage.src = origData.src;
  canvas.oImage.onload = function()
  {
   let ctx = canvas.getContext('2d');
   ctx.save();
   if (pImage.hFlip === true && pImage.vFlip === true)
   {
    ctx.translate(canvas.width, canvas.height);
    ctx.scale(-1, -1);
   }
   else if (pImage.hFlip === true)
   {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
   }
   else if (pImage.vFlip === true)
   {
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
   }
   if (theta <= Math.PI / 2)
    ctx.translate(Math.sin(theta) * canvas.oImage.naturalHeight, 0);
   else if (theta <= Math.PI)
    ctx.translate(canvas.width, -Math.cos(theta) * canvas.oImage.naturalHeight);
   else if (theta <= 1.5 * Math.PI)
    ctx.translate(-Math.cos(theta) * canvas.oImage.naturalWidth, canvas.height);
   else
    ctx.translate(0, -Math.sin(theta) * canvas.oImage.naturalWidth);
   pImage.originalPxWidth = costheta * origData.originalPxWidth + sintheta * origData.originalPxHeight;
   pImage.originalPxHeight = costheta * origData.originalPxHeight + sintheta * origData.originalPxWidth;
   pImage.originalWidth = costheta * origData.originalWidth + sintheta * origData.originalHeight;
   pImage.originalHeight = costheta * origData.originalHeight + sintheta * origData.originalWidth;
   let t0 = Math.PI * pImage.angle / 180;
   let natWidthT0 = Math.abs(Math.cos(t0)) * origData.naturalWidth + Math.abs(Math.sin(t0)) * origData.naturalHeight;
   let natHeightT0 = Math.abs(Math.cos(t0)) * origData.naturalHeight + Math.abs(Math.sin(t0)) * origData.naturalWidth;
   pImage.style.width = (getDimInt(pImage.style.width) * canvas.width / natWidthT0) + getDimUnit(pImage.style.width);
   pImage.style.height = (getDimInt(pImage.style.height) * canvas.height / natHeightT0) + getDimUnit(pImage.style.height);
   pImage.angle = degrees;
   ctx.rotate(theta);
   ctx.clearRect(0, 0, canvas.oImage.naturalWidth, canvas.oImage.naturalHeight);
   ctx.drawImage(canvas.oImage, 0, 0, canvas.oImage.naturalWidth, canvas.oImage.naturalHeight);
   ctx.restore();
   pImage.src = canvas.toDataURL();
   bizarre.callBackStatus();
  };
 }
 function isFitted()
 {
  let imageDiff;
  let bScreen = new zarScreen(pImage);
  let screenHeight = bScreen.getHeight();
  let screenWidth = bScreen.getWidth();
  let screenDim = screenWidth / screenHeight;
  let imageDim = pImage.width / pImage.height;
  if (screenDim < imageDim)
   imageDiff = Math.abs(screenWidth - pImage.width);
  else
   imageDiff = Math.abs(screenHeight - pImage.height);
  return imageDiff < 50;
 }
 function fit(autoScroll, widthOnly)
 {
  if (!enabled)
   return;
  let bScreen = new zarScreen(pImage);
  let screenHeight = bScreen.getHeight();
  let screenWidth = bScreen.getWidth();
  let screenDim = screenWidth / screenHeight;
  let imageDim = pImage.width / pImage.height;
  if (screenDim < imageDim || widthOnly)
   setDimension(screenWidth, parseInt(screenWidth / imageDim + 0.5, 10));
  else
   setDimension(parseInt(screenHeight * imageDim + 0.5, 10), screenHeight);
  screenHeight = bScreen.getHeight();
  screenWidth = bScreen.getWidth();
  if (screenDim < imageDim || widthOnly)
   setDimension(screenWidth, parseInt(screenWidth / imageDim + 0.5,10));
  else 
   setDimension(parseInt(screenHeight * imageDim + 0.5,10), screenHeight);
  if (!autoScroll)
   return;
  let iTop = 0;
  let iLeft = 0;
  let cNode = pImage;
  while (cNode.tagName.toUpperCase() !== 'BODY')
  {
   iLeft += cNode.offsetLeft;
   iTop += cNode.offsetTop;
   cNode = cNode.offsetParent;
  }
  if (screenDim < imageDim || widthOnly)
   pImage.ownerDocument.defaultView.scroll(iLeft - (bScreen.getPad()), iTop - ((screenHeight - getDimInt(pImage.style.height)) / 2) - (bScreen.getPad()));
  else 
   pImage.ownerDocument.defaultView.scroll(iLeft - ((screenWidth - getDimInt(pImage.style.width)) / 2) - (bScreen.getPad()), iTop - (bScreen.getPad()));
 }
 function zoomFactor()
 {
  return parseInt(parseInt(pImage.zoomFactor,10) + 0.5,10);
 }
 function pZoomAbs()
 {
  if (pImage.originalWidth)
   pImage.style.width = (pImage.originalWidth * (pImage.zoomFactor / 100)) + pImage.originalWidthUnit;
  else
   pImage.style.width = '';
  if (pImage.originalHeight)
   pImage.style.height = (pImage.originalHeight * (pImage.zoomFactor / 100)) + pImage.originalHeightUnit;
  else
   pImage.style.height = '';
 }
 function getDimUnit(sText)
 {
  let ValidChars = '0123456789.';
  let ret = '';
  for (let i = 0; i < sText.length; i++)
  {
   let chr = sText.charAt(i);
   if (ValidChars.indexOf(chr) === -1)
    ret += chr;
  }
  return ret;
 }
 function getDimInt(sText)
 {
  let ValidChars = '0123456789.';
  let ret = '';
  for (let i = 0; i < sText.length; i++)
  {
   let chr = sText.charAt(i);
   if (ValidChars.indexOf(chr) >= 0)
    ret += chr;
  }
  return ret;
 }
}

function zarScreen(pImage)
{
 const padValue = 17;
 this.getWidth = function()
 {
  if (pImage.ownerDocument.compatMode === 'BackCompat')
   return pImage.ownerDocument.body.clientWidth - padValue;
  return pImage.ownerDocument.documentElement.clientWidth - padValue;
 };
 this.getHeight = function()
 {
  if (pImage.ownerDocument.compatMode === 'BackCompat')
   return pImage.ownerDocument.body.clientHeight - padValue;
  return pImage.ownerDocument.documentElement.clientHeight - padValue;
 };
 this.getPad = function()
 {
  return padValue / 2;
 };
}

window.addEventListener('load', bizarre.init, false);
