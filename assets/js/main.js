    const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1454428886577188924/qOOuaPFVttB2Unq2YhHc-rOrrFOQzC3h2IKt1GSTZv8exiHhOFGjlX2stIGXQdSx0Y87';
    let currentSort = 'default';
    let itemsData = [];

    // Stars background
    function createStars() {
      const container = document.getElementById('stars');
      const frag = document.createDocumentFragment();
      for (let i = 0; i < 50; i++) {
        const s = document.createElement('div');
        s.className = 'star';
        const size = Math.random() * 2 + 1;
        s.style.width = s.style.height = `${size}px`;
        s.style.left = `${Math.random() * 100}%`;
        s.style.top = `${Math.random() * 100}%`;
        s.style.setProperty('--anim-dur', `${Math.random() * 3 + 2}s`);
        frag.appendChild(s);
      }
      container.appendChild(frag);
    }

    // Load download counts from localStorage
    function loadDownloadCounts() {
      const items = document.querySelectorAll('.item');
      itemsData = [];
      
      items.forEach((item, index) => {
        const uuid = item.getAttribute('data-uuid');
        const title = item.querySelector('h2').textContent;
        const category = item.getAttribute('data-category');
        const subtitle = item.querySelector('.subtitle').textContent;
        const image = item.querySelector('img').src;
        
        // Get saved data from localStorage
        const savedData = localStorage.getItem(`item_${uuid}`);
        let downloadCount = 0;
        let lastUpdated = new Date().toISOString().split('T')[0];
        
        if (savedData) {
          const parsed = JSON.parse(savedData);
          downloadCount = parsed.downloadCount || 0;
          lastUpdated = parsed.lastUpdated || lastUpdated;
        }
        
        itemsData.push({
          uuid,
          title,
          category,
          subtitle,
          image,
          element: item,
          downloadCount,
          htmlIndex: index,
          lastUpdated
        });
      });
      
      // Load current sort
      const savedSort = localStorage.getItem('marketplace_sort');
      if (savedSort) {
        currentSort = savedSort;
        updateSortUI();
      }
    }

    // Save download count to localStorage
    function saveDownloadCount(uuid, count) {
      const itemData = {
        downloadCount: count,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      localStorage.setItem(`item_${uuid}`, JSON.stringify(itemData));
    }

    // Save current sort
    function saveCurrentSort() {
      localStorage.setItem('marketplace_sort', currentSort);
    }

    // Increment download count
    function incrementDownloadCount(uuid) {
      const item = itemsData.find(item => item.uuid === uuid);
      if (item) {
        item.downloadCount++;
        item.lastUpdated = new Date().toISOString().split('T')[0];
        saveDownloadCount(uuid, item.downloadCount);
        updateItemDisplay();
      }
    }

    // Update item display with download counts
    function updateItemDisplay() {
      const showDownloadCount = currentSort === 'popularity';
      
      itemsData.forEach(item => {
        // Find the title-row or create it
        let titleRow = item.element.querySelector('.title-row');
        if (!titleRow) {
          const subtitle = item.element.querySelector('.subtitle');
          if (subtitle) {
            titleRow = document.createElement('div');
            titleRow.className = 'title-row';
            subtitle.parentNode.insertBefore(titleRow, subtitle);
            titleRow.appendChild(subtitle);
          }
        }
        
        // Find or create download count element
        let downloadCountElement = item.element.querySelector('.download-count');
        if (!downloadCountElement && titleRow) {
          downloadCountElement = document.createElement('div');
          downloadCountElement.className = 'download-count';
          titleRow.appendChild(downloadCountElement);
        }
        
        if (downloadCountElement) {
          downloadCountElement.innerHTML = `<i class="fas fa-download"></i> ${item.downloadCount}`;
          if (showDownloadCount) {
            downloadCountElement.classList.add('show');
          } else {
            downloadCountElement.classList.remove('show');
          }
        }
      });
    }

    // Sort items based on selected option
    function sortItems(items) {
      const sorted = [...items];
      
      switch(currentSort) {
        case 'popularity':
          return sorted.sort((a, b) => b.downloadCount - a.downloadCount);
        case 'recent':
          // Higher HTML index = newer (appears later in code)
          return sorted.sort((a, b) => b.htmlIndex - a.htmlIndex);
        case 'name':
          return sorted.sort((a, b) => a.title.localeCompare(b.title));
        default:
          // Default: Randomize like in market11.html
          return sorted.sort(() => Math.random() - 0.5);
      }
    }

    // Render items with current filter and sort
    function renderItems() {
      const container = document.getElementById('itemContainer');
      const activeFilter = document.querySelector('.category-buttons button.active').dataset.filter;
      
      // Filter items
      let filteredItems = itemsData;
      if (activeFilter !== 'all') {
        filteredItems = itemsData.filter(item => item.category === activeFilter);
      }
      
      // Sort items
      const sortedItems = sortItems(filteredItems);
      
      // Clear container
      container.innerHTML = '';
      
      // Append sorted items
      sortedItems.forEach(item => {
        container.appendChild(item.element);
      });
      
      // Update display with download counts
      updateItemDisplay();
    }

    // Update sort UI
    function updateSortUI() {
      document.querySelectorAll('.sort-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.sort === currentSort) {
          option.classList.add('active');
        }
      });
    }

    createStars();

    // Search filter
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        document.querySelectorAll('.item').forEach(item => {
          const title = item.querySelector('h2').textContent.toLowerCase();
          item.style.display = title.includes(q) ? 'flex' : 'none';
        });
      }, 200);
    });

    // Category filter - UPDATED
    document.querySelectorAll('.category-buttons button').forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active button
        document.querySelectorAll('.category-buttons button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        renderItems();
      });
    });

    // Settings button toggle
    const settingsBtn = document.getElementById('settingsBtn');
    const sortDropdown = document.getElementById('sortDropdown');
    
    if (settingsBtn) {
      settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsBtn.classList.toggle('active');
        sortDropdown.classList.toggle('active');
      });
    }

    // Sort option selection
    document.querySelectorAll('.sort-option').forEach(option => {
      option.addEventListener('click', () => {
        currentSort = option.dataset.sort;
        updateSortUI();
        saveCurrentSort();
        renderItems();
        
        // Close dropdown
        if (settingsBtn) settingsBtn.classList.remove('active');
        if (sortDropdown) sortDropdown.classList.remove('active');
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (sortDropdown && settingsBtn && !sortDropdown.contains(e.target) && !settingsBtn.contains(e.target)) {
        settingsBtn.classList.remove('active');
        sortDropdown.classList.remove('active');
      }
    });

    // Function to validate Minecraft Marketplace links
    function isValidMarketplaceLink(url) {
      // Accept both types of marketplace links
      const validPatterns = [
        /^https:\/\/www\.minecraft\.net\/en-us\/marketplace\//,
        /^https:\/\/marketplace\.minecraft\.net\/en-us\/pdp\?id=/
      ];
      
      // Check if URL matches any valid pattern
      return validPatterns.some(pattern => pattern.test(url));
    }

    // Send Request - UPDATED
    document.getElementById('sendButton').addEventListener('click', async () => {
      const inp = document.getElementById('linkInput');
      const url = inp.value.trim();
      
      // Validate the link
      if (!isValidMarketplaceLink(url)) {
        alert('Only Send Minecraft Marketplace Links');
        return;
      }
      
      const btn = document.getElementById('sendButton');
      try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        const res = await fetch(DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({content:`Request: ${url}`})
        });
        if (!res.ok) throw new Error();
        alert('Request Sent Successfully!');
        inp.value = '';
      } catch {
        alert('Failed to send request');
      } finally {
        btn.disabled=false;
        btn.innerHTML='<i class="fas fa-paper-plane"></i>';
      }
    });

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
      // Load data and setup
      loadDownloadCounts();
      renderItems();
      
      // Category names for reference
      const categoryNames = {
        worlds: "World",
        addons: "Addon",
        mashups: "Mashup",
        textures: "Texture",
        skins: "Skin"
      };
      
      // Initialize item structure (ensure subtitles are set)
      document.querySelectorAll('.item').forEach(item => {
        const cat = item.dataset.category;
        const subtitleText = categoryNames[cat] || "Item";
        const subtitle = item.querySelector('.subtitle');
        if (subtitle) {
          subtitle.textContent = subtitleText;
        }
      });
    });

    // === Download Overlay Functionality - UPDATED ===
    const overlay = document.getElementById('downloadOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalImage = document.getElementById('modalImage');
    const modalType = document.getElementById('modalType');
    const downloadLinks = document.getElementById('downloadLinks');
    const closeModal = document.getElementById('closeModal');
    const hiddenLinks = document.getElementById('hiddenLinks');

    // Open overlay when item is clicked
    document.addEventListener('click', (e) => {
      const item = e.target.closest('.item');
      if (item && !e.target.closest('.download-count')) {
        const title = item.querySelector('h2').textContent;
        const subtitle = item.querySelector('.subtitle').textContent;
        const imageSrc = item.querySelector('img').src;
        const uuid = item.getAttribute('data-uuid');
        
        // Set modal content
        modalTitle.textContent = title;
        modalImage.src = imageSrc;
        modalType.textContent = subtitle;
        
        // Clear previous links
        downloadLinks.innerHTML = '';
        
        // Find and copy the pre-loaded links for this item
        const itemLinksContainer = hiddenLinks.querySelector(`.item-links[data-uuid="${uuid}"]`);
        if (itemLinksContainer) {
          // Clone all the download links for this item
          const links = itemLinksContainer.querySelectorAll('.download-link');
          links.forEach(link => {
            const clonedLink = link.cloneNode(true);
            
            // Add click event to track downloads
            clonedLink.addEventListener('click', () => {
              incrementDownloadCount(uuid);
            });
            
            downloadLinks.appendChild(clonedLink);
          });
        }
        
        // Show overlay
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
      }
    });

    // Close overlay
    closeModal.addEventListener('click', () => {
      overlay.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
    });

    // Close overlay when clicking outside the modal
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
      }
    });

    // Close overlay with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
      }
    });
