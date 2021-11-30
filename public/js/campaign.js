// eslint-disable-next-line import/extensions
import { getUrl } from './base.js';

const banner = document.querySelector('.banner');
const allCampaignElements = document.getElementsByClassName('campaign');
const allDotElements = document.getElementsByClassName('dot');
let activeCampaignIndex = 0;

function setActiveCampaign(activeIndex) {
  document.querySelector('.campaign-active').className = 'campaign';
  document.querySelector('.dot-active').className = 'dot';
  allCampaignElements[activeIndex].classList.add('campaign-active');
  allDotElements[activeIndex].classList.add('dot-active');
  activeCampaignIndex = activeIndex;
}

function createAllCampaignElement(campaignData) {
  const dots = document.createElement('div');
  dots.className = 'dots';
  for (let campaignIndex = 0; campaignIndex < campaignData.length; campaignIndex += 1) {
    const newCampaign = document.createElement('a');
    const newStory = document.createElement('div');
    const dot = document.createElement('div');

    const { product_id: productId, picture, story } = campaignData[campaignIndex];
    const storyFormat = story.replace(/\r\n/g, '<br/>');

    newCampaign.className = campaignIndex === 0 ? 'campaign campaign-active' : 'campaign';
    newCampaign.dataset.product_id = productId;
    newCampaign.style = `background-image: url(${picture})`;
    newCampaign.href = `./product.html?id=${productId}`;
    newStory.className = 'story';
    newStory.innerHTML = storyFormat;
    dot.className = campaignIndex === 0 ? 'dot dot-active' : 'dot';
    dot.addEventListener('click', () => setActiveCampaign(campaignIndex));

    newCampaign.appendChild(newStory);
    banner.appendChild(newCampaign);
    dots.appendChild(dot);
  }
  banner.appendChild(dots);
}

function changeCampaign(timer) {
  setInterval(() => {
    activeCampaignIndex = (activeCampaignIndex + 1) % allCampaignElements.length;
    setActiveCampaign(activeCampaignIndex);
  }, timer);
}

function renderCampaigns(dataFromAJAX) {
  const campaignData = dataFromAJAX.data;
  const timer = 5000;
  createAllCampaignElement(campaignData);
  changeCampaign(timer);
}

const campaignsUrl = getUrl(['marketing', 'campaigns']);
fetch(campaignsUrl)
  .then((res) => res.json())
  .then((res) => renderCampaigns(res));
