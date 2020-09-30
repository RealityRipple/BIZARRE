/* ***** BEGIN LICENSE BLOCK *****

 Copyright (c) 2006-2013  Jason Adams <imagezoom@yellowgorilla.net>

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

function OptionCache()
{
 let optionNames = [];
 let optionValues = [];
 function setOption(optionName, optionValue)
 {
  for (let i = 0; i < optionNames.length; i++)
  {
   if (optionNames[i] === optionName)
   {
    optionValues[i] = optionValue;
    return;
   }
  }
  optionNames[optionNames.length] = optionName;
  optionValues[optionValues.length] = optionValue;
 }
 this.getOption = getOption;
 this.setOption = setOption;
 this.length = length;
 function getOption(optionName)
 {
  for (let i = 0; i < optionNames.length; i++)
  {
   if (optionNames[i] === optionName)
    return optionValues[i];
  }
  return null;
 }
 function length()
 {
  return optionNames.length;
 }
}
let menuItems = new Array('context-zoom-zin', 'context-zoom-zout', 'context-zoom-zreset', 'context-zoom-zcustom', 'context-zoom-dcustom', 'context-zoom-fit', 'context-zoom-fitwidth', 'context-zoom-rotate-right', 'context-zoom-rotate-left', 'context-zoom-rotate-180', 'context-zoom-flip-h', 'context-zoom-flip-v', 'context-zoom-rotate-reset', 'zoomsub-zin', 'zoomsub-zout', 'zoomsub-zreset', 'zoomsub-rotate-right', 'zoomsub-rotate-left', 'zoomsub-rotate-180', 'zoomsub-flip-h', 'zoomsub-flip-v', 'zoomsub-rotate-reset', 'zoomsub-zcustom', 'zoomsub-dcustom', 'zoomsub-fit', 'zoomsub-fitwidth', 'zoomsub-z400', 'zoomsub-z200', 'zoomsub-z150', 'zoomsub-z125', 'zoomsub-z100', 'zoomsub-z75', 'zoomsub-z50', 'zoomsub-z25', 'zoomsub-z10');
let optionItems = new Array('mmZoomIO', 'mmZoomIO', 'mmReset', 'mmCustomZoom', 'mmCustomDim', 'mmFitWindow', 'mmFitWidth', 'mmRotateRight', 'mmRotateLeft', 'mmRotate180', 'mmFlipH', 'mmFlipV', 'mmRotateReset', 'smZoomIO', 'smZoomIO', 'smReset', 'smRotateRight', 'smRotateLeft', 'smRotate180', 'smFlipH', 'smFlipV', 'smRotateReset', 'smCustomZoom', 'smCustomDim', 'smFitWindow', 'smFitWidth', 'smZoomPcts', 'smZoomPcts', 'smZoomPcts', 'smZoomPcts', 'smZoomPcts', 'smZoomPcts', 'smZoomPcts', 'smZoomPcts', 'smZoomPcts');
let menuOptions = new OptionCache();
let nsIPrefServiceObj = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);
let nsIPrefBranchObj = nsIPrefServiceObj.getBranch('extensions.bizarre.');
function bizarre_saveOptions()
{
 if (!validateOptions())
  return false;
 for (let i = 0; i < menuItems.length; i++)
 {
  if (document.getElementById(menuItems[i]).tagName.toLowerCase() === 'checkbox')
   nsIPrefBranchObj.setBoolPref(optionItems[i], menuOptions.getOption(optionItems[i]));
 }
 nsIPrefBranchObj.setBoolPref('usescroll', document.getElementById('bizarreusemouseoptions').checked);
 nsIPrefBranchObj.setIntPref('scrollvalue', document.getElementById('bizarrescrollvalue').value);
 nsIPrefBranchObj.setIntPref('scrollmode', document.getElementById('bizarrescrollmode').value);
 nsIPrefBranchObj.setIntPref('zoomvalue', document.getElementById('bizarrezoomvalue').value);
 nsIPrefBranchObj.setBoolPref('autocenter', document.getElementById('bizarreautocenter').checked);
 nsIPrefBranchObj.setBoolPref('showStatus', document.getElementById('bizarreshowstatus').checked);
 nsIPrefBranchObj.setIntPref('triggerbutton', document.getElementById('bizarremouseaccess').value);
 nsIPrefBranchObj.setIntPref('imagefitbutton', document.getElementById('bizarreimagefitbutton').value);
 nsIPrefBranchObj.setIntPref('imageresetbutton', document.getElementById('bizarreimageresetbutton').value);
 nsIPrefBranchObj.setBoolPref('toggleFitReset', document.getElementById('bizarretogglefitreset').checked);
 nsIPrefBranchObj.setBoolPref('reversescrollzoom', document.getElementById('bizarrereversescroll').checked);
 nsIPrefBranchObj.setIntPref('rotateKeys', document.getElementById('bizarrerotatekeys').value);
 nsIPrefBranchObj.setIntPref('rotateValue', document.getElementById('bizarrerotatevalue').value);
 return true;
}
function validateOptions()
{
 if ((document.getElementById('bizarremouseaccess').value === document.getElementById('bizarreimagefitbutton').value) || (document.getElementById('bizarremouseaccess').value === document.getElementById('bizarreimageresetbutton').value) || ((document.getElementById('bizarreimageresetbutton').value === document.getElementById('bizarreimagefitbutton').value) && (document.getElementById('bizarreimagefitbutton').value !== '0')))
 {
  alert(document.getElementById('bundle_BIZARRE').getString('op_mouse_error'));
  return false;
 }
 return true;
}
function bizarre_initializeOptions()
{
 document.getElementById('bizarreusemouseoptions').checked = nsIPrefBranchObj.getBoolPref('usescroll');
 let scroll = nsIPrefBranchObj.getIntPref('scrollvalue');
 let scrollValueBox = document.getElementById('bizarrescrollvalue');
 scrollValueBox.selectedItem = scrollValueBox.getElementsByAttribute('value', scroll)[0];
 scroll = nsIPrefBranchObj.getIntPref('scrollmode');
 scrollValueBox = document.getElementById('bizarrescrollmode');
 scrollValueBox.selectedItem = scrollValueBox.getElementsByAttribute('value', scroll)[0];
 scroll = nsIPrefBranchObj.getIntPref('triggerbutton');
 scrollValueBox = document.getElementById('bizarremouseaccess');
 scrollValueBox.selectedItem = scrollValueBox.getElementsByAttribute('value', scroll)[0];
 scroll = nsIPrefBranchObj.getIntPref('imagefitbutton');
 scrollValueBox = document.getElementById('bizarreimagefitbutton');
 scrollValueBox.selectedItem = scrollValueBox.getElementsByAttribute('value', scroll)[0];
 scroll = nsIPrefBranchObj.getIntPref('imageresetbutton');
 scrollValueBox = document.getElementById('bizarreimageresetbutton');
 scrollValueBox.selectedItem = scrollValueBox.getElementsByAttribute('value', scroll)[0];
 scroll = nsIPrefBranchObj.getIntPref('rotateKeys');
 scrollValueBox = document.getElementById('bizarrerotatekeys');
 scrollValueBox.selectedItem = scrollValueBox.getElementsByAttribute('value', scroll)[0];
 scroll = nsIPrefBranchObj.getIntPref('rotateValue');
 scrollValueBox = document.getElementById('bizarrerotatevalue');
 scrollValueBox.selectedItem = scrollValueBox.getElementsByAttribute('value', scroll)[0];
 let zoom = nsIPrefBranchObj.getIntPref('zoomvalue');
 let zoomValueBox = document.getElementById('bizarrezoomvalue');
 zoomValueBox.selectedItem = zoomValueBox.getElementsByAttribute('value', zoom)[0];
 document.getElementById('bizarreautocenter').checked = nsIPrefBranchObj.getBoolPref('autocenter');
 document.getElementById('bizarreshowstatus').checked = nsIPrefBranchObj.getBoolPref('showStatus');
 document.getElementById('bizarrereversescroll').checked = nsIPrefBranchObj.getBoolPref('reversescrollzoom');
 document.getElementById('bizarretogglefitreset').checked = nsIPrefBranchObj.getBoolPref('toggleFitReset');
 for (let i = 0; i < menuItems.length; i++)
 {
  menuOptions.setOption(optionItems[i], nsIPrefBranchObj.getBoolPref(optionItems[i]));
  document.getElementById(menuItems[i]).setAttribute('hidden', 'false');
 }
 setDisableAllChildren(document.getElementById('mouseoptions'), !document.getElementById('bizarreusemouseoptions').checked);
 setBIZARREMenu();
}
function setBIZARREMenu()
{
 for (let i = 0; i < menuItems.length; i++)
 {
  if (document.getElementById(menuItems[i]) === null)
   alert(menuItems[i]);
  document.getElementById(menuItems[i]).setAttribute('checked', menuOptions.getOption(optionItems[i]));
 }
 document.getElementById('context-zoomsub').checked = document.getElementById('submenu').getElementsByAttribute('checked', true).length > 0;
 document.getElementById('context-rotatesub').checked = document.getElementById('subrotatemenu').getElementsByAttribute('checked', true).length > 0;
}
function setPreference(izCheck)
{
 for (let i = 0; i < menuItems.length; i++)
 {
  if (izCheck.id === menuItems[i]) 
  {
   menuOptions.setOption(optionItems[i], izCheck.checked);
   break;
  }
 }
}
function setOption(izCheck)
{
 setPreference(izCheck);
 setBIZARREMenu();
}
function setDisableAllChildren(xulElement, disabled)
{
 for (let i = 0; i < xulElement.childNodes.length; i++)
 {
  xulElement.childNodes[i].disabled = disabled;
  setDisableAllChildren(xulElement.childNodes[i], disabled);
 }
}
function toggleSubMenu()
{
 let checkboxes = document.getElementById('submenu').getElementsByTagName('checkbox');
 for (let i = 0; i < checkboxes.length; i++)
 {
  checkboxes[i].checked = document.getElementById('context-zoomsub').checked;
  setPreference(checkboxes[i]);
 }
 setBIZARREMenu();
}
function toggleRotateMenu()
{
 let checkboxes = document.getElementById('subrotatemenu').getElementsByTagName('checkbox');
 for (let i = 0; i < checkboxes.length; i++)
 {
  checkboxes[i].checked = document.getElementById('context-rotatesub').checked;
  setPreference(checkboxes[i]);
 }
 setBIZARREMenu();
}
function togglePercentages()
{
 let pctOption = document.getElementById('zoomsub-z100');
 pctOption.checked = !pctOption.checked;
 setOption(pctOption);
}
