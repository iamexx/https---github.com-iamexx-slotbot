/**
 * Class to handle the creation and management of slot symbols
 */
class SymbolFactory {
  constructor(scene) {
    this.scene = scene;
    this.symbolCache = {};
    this.symbolSize = { width: 0.9, height: 0.9, depth: 0.1 };
    
    // Define symbol colors
    this.symbolColors = {
      'cherry': 0xFF0000,
      'grapes': 0x800080,
      'watermelon': 0xFF6666,
      'orange': 0xFFA500,
      'lemon': 0xFFFF00,
      'plum': 0x8B4513,
      '7': 0xFF0000,
      'star': 0xFFD700
    };
  }
  
  /**
   * Create a symbol mesh based on the symbol name
   */
  createSymbol(symbolName) {
    // Check if we already have this symbol in cache
    if (this.symbolCache[symbolName]) {
      return this.symbolCache[symbolName].clone();
    }
    
    // Create a group to hold the symbol parts
    const symbolGroup = new THREE.Group();
    
    // Create the base for all symbols
    const baseGeometry = new THREE.BoxGeometry(
      this.symbolSize.width, 
      this.symbolSize.height, 
      this.symbolSize.depth
    );
    const baseMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.1,
      shininess: 100
    });
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    symbolGroup.add(baseMesh);
    
    // Add specific symbol geometry
    switch (symbolName) {
      case 'cherry':
        this.addCherryGeometry(symbolGroup);
        break;
      case 'grapes':
        this.addGrapesGeometry(symbolGroup);
        break;
      case 'watermelon':
        this.addWatermelonGeometry(symbolGroup);
        break;
      case 'orange':
        this.addOrangeGeometry(symbolGroup);
        break;
      case 'lemon':
        this.addLemonGeometry(symbolGroup);
        break;
      case 'plum':
        this.addPlumGeometry(symbolGroup);
        break;
      case '7':
        this.addSevenGeometry(symbolGroup);
        break;
      case 'star':
        this.addStarGeometry(symbolGroup);
        break;
    }
    
    // Cache the symbol
    this.symbolCache[symbolName] = symbolGroup;
    
    return symbolGroup.clone();
  }
  
  /**
   * Add cherry geometry to the symbol group
   */
  addCherryGeometry(group) {
    const cherryMaterial = new THREE.MeshPhongMaterial({ 
      color: this.symbolColors.cherry,
      shininess: 100
    });
    
    // Create two cherries
    const cherryGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    
    const cherry1 = new THREE.Mesh(cherryGeometry, cherryMaterial);
    cherry1.position.set(-0.2, -0.1, 0.1);
    group.add(cherry1);
    
    const cherry2 = new THREE.Mesh(cherryGeometry, cherryMaterial);
    cherry2.position.set(0.2, 0.1, 0.1);
    group.add(cherry2);
    
    // Create stems
    const stemMaterial = new THREE.MeshPhongMaterial({ color: 0x00AA00 });
    const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8);
    
    const stem1 = new THREE.Mesh(stemGeometry, stemMaterial);
    stem1.position.set(-0.1, 0.2, 0.1);
    stem1.rotation.z = Math.PI / 4;
    group.add(stem1);
    
    const stem2 = new THREE.Mesh(stemGeometry, stemMaterial);
    stem2.position.set(0.1, 0.3, 0.1);
    stem2.rotation.z = -Math.PI / 4;
    group.add(stem2);
  }
  
  /**
   * Add grapes geometry to the symbol group
   */
  addGrapesGeometry(group) {
    const grapesMaterial = new THREE.MeshPhongMaterial({ 
      color: this.symbolColors.grapes,
      shininess: 100
    });
    
    const grapeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    
    // Create grape cluster
    const positions = [
      [0, 0, 0], [0.2, 0, 0], [0.4, 0, 0],
      [-0.1, -0.2, 0], [0.1, -0.2, 0], [0.3, -0.2, 0], [0.5, -0.2, 0],
      [0, -0.4, 0], [0.2, -0.4, 0], [0.4, -0.4, 0],
      [0.1, -0.6, 0], [0.3, -0.6, 0]
    ];
    
    positions.forEach(pos => {
      const grape = new THREE.Mesh(grapeGeometry, grapesMaterial);
      grape.position.set(pos[0] - 0.2, pos[1] + 0.3, pos[2] + 0.1);
      group.add(grape);
    });
    
    // Add stem
    const stemMaterial = new THREE.MeshPhongMaterial({ color: 0x00AA00 });
    const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
    
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.set(0.2, 0.4, 0.1);
    group.add(stem);
  }
  
  /**
   * Add watermelon geometry to the symbol group
   */
  addWatermelonGeometry(group) {
    // Create watermelon slice
    const sliceShape = new THREE.Shape();
    sliceShape.moveTo(0, 0);
    sliceShape.absarc(0, 0, 0.4, 0, Math.PI / 2, false);
    sliceShape.lineTo(0, 0);
    
    const extrudeSettings = {
      steps: 1,
      depth: 0.1,
      bevelEnabled: false
    };
    
    const sliceGeometry = new THREE.ExtrudeGeometry(sliceShape, extrudeSettings);
    
    // Red part
    const redMaterial = new THREE.MeshPhongMaterial({ 
      color: this.symbolColors.watermelon,
      shininess: 80
    });
    const redSlice = new THREE.Mesh(sliceGeometry, redMaterial);
    redSlice.position.set(-0.2, -0.2, 0.1);
    group.add(redSlice);
    
    // Green rind
    const rindShape = new THREE.Shape();
    rindShape.moveTo(0, 0);
    rindShape.absarc(0, 0, 0.45, 0, Math.PI / 2, false);
    rindShape.lineTo(0.45, 0);
    rindShape.absarc(0, 0, 0.4, Math.PI / 2, 0, true);
    rindShape.lineTo(0, 0);
    
    const rindGeometry = new THREE.ExtrudeGeometry(rindShape, extrudeSettings);
    const rindMaterial = new THREE.MeshPhongMaterial({ color: 0x00AA00 });
    const rind = new THREE.Mesh(rindGeometry, rindMaterial);
    rind.position.set(-0.2, -0.2, 0.05);
    group.add(rind);
    
    // Seeds
    const seedMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const seedGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    
    for (let i = 0; i < 5; i++) {
      const angle = Math.PI / 4 - (i * 0.1);
      const radius = 0.25;
      const x = Math.cos(angle) * radius - 0.2;
      const y = Math.sin(angle) * radius - 0.2;
      
      const seed = new THREE.Mesh(seedGeometry, seedMaterial);
      seed.position.set(x, y, 0.16);
      group.add(seed);
    }
  }
  
  /**
   * Add orange geometry to the symbol group
   */
  addOrangeGeometry(group) {
    // Create orange
    const orangeGeometry = new THREE.SphereGeometry(0.35, 32, 32);
    const orangeMaterial = new THREE.MeshPhongMaterial({ 
      color: this.symbolColors.orange,
      shininess: 80
    });
    
    const orange = new THREE.Mesh(orangeGeometry, orangeMaterial);
    orange.position.set(0, 0, 0.1);
    group.add(orange);
    
    // Add leaf
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.1, 0.1, 0.2, 0);
    leafShape.quadraticCurveTo(0.1, -0.1, 0, 0);
    
    const leafExtrudeSettings = {
      steps: 1,
      depth: 0.02,
      bevelEnabled: false
    };
    
    const leafGeometry = new THREE.ExtrudeGeometry(leafShape, leafExtrudeSettings);
    const leafMaterial = new THREE.MeshPhongMaterial({ color: 0x00AA00 });
    
    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    leaf.position.set(-0.1, 0.35, 0.1);
    group.add(leaf);
  }
  
  /**
   * Add lemon geometry to the symbol group
   */
  addLemonGeometry(group) {
    // Create lemon (ellipsoid)
    const lemonGeometry = new THREE.SphereGeometry(0.35, 32, 16);
    lemonGeometry.scale(1, 0.6, 0.8);
    
    const lemonMaterial = new THREE.MeshPhongMaterial({ 
      color: this.symbolColors.lemon,
      shininess: 80
    });
    
    const lemon = new THREE.Mesh(lemonGeometry, lemonMaterial);
    lemon.position.set(0, 0, 0.1);
    lemon.rotation.z = Math.PI / 4; // Tilt the lemon
    group.add(lemon);
    
    // Add texture lines
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xDDDD00 });
    
    for (let i = -2; i <= 2; i++) {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i * 0.1, -0.3, 0.2),
        new THREE.Vector3(i * 0.1, 0.3, 0.2)
      ]);
      
      const line = new THREE.Line(lineGeometry, lineMaterial);
      line.rotation.z = Math.PI / 4; // Match lemon rotation
      group.add(line);
    }
  }
  
  /**
   * Add plum geometry to the symbol group
   */
  addPlumGeometry(group) {
    // Create plum
    const plumGeometry = new THREE.SphereGeometry(0.35, 32, 32);
    const plumMaterial = new THREE.MeshPhongMaterial({ 
      color: this.symbolColors.plum,
      shininess: 80
    });
    
    const plum = new THREE.Mesh(plumGeometry, plumMaterial);
    plum.position.set(0, 0, 0.1);
    group.add(plum);
    
    // Add highlight
    const highlightGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const highlightMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.3
    });
    
    const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
    highlight.position.set(-0.15, 0.15, 0.35);
    group.add(highlight);
    
    // Add stem
    const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8);
    const stemMaterial = new THREE.MeshPhongMaterial({ color: 0x00AA00 });
    
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.set(0, 0.4, 0.1);
    group.add(stem);
  }
  
  /**
   * Add seven geometry to the symbol group
   */
  addSevenGeometry(group) {
    // Create 7 shape
    const sevenShape = new THREE.Shape();
    sevenShape.moveTo(-0.2, 0.3);
    sevenShape.lineTo(0.2, 0.3);
    sevenShape.lineTo(0.2, 0.2);
    sevenShape.lineTo(0, -0.3);
    sevenShape.lineTo(-0.1, -0.3);
    sevenShape.lineTo(0.1, 0.2);
    sevenShape.lineTo(-0.2, 0.2);
    sevenShape.lineTo(-0.2, 0.3);
    
    const extrudeSettings = {
      steps: 1,
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3
    };
    
    const sevenGeometry = new THREE.ExtrudeGeometry(sevenShape, extrudeSettings);
    const sevenMaterial = new THREE.MeshPhongMaterial({ 
      color: this.symbolColors['7'],
      shininess: 100
    });
    
    const seven = new THREE.Mesh(sevenGeometry, sevenMaterial);
    seven.position.z = 0.05;
    group.add(seven);
    
    // Add shine effect
    const shineGeometry = new THREE.PlaneGeometry(0.4, 0.05);
    const shineMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.5
    });
    
    const shine = new THREE.Mesh(shineGeometry, shineMaterial);
    shine.position.set(0, 0.1, 0.2);
    shine.rotation.x = -Math.PI / 6;
    group.add(shine);
  }
  
  /**
   * Add star geometry to the symbol group
   */
  addStarGeometry(group) {
    // Create star shape
    const starShape = new THREE.Shape();
    const outerRadius = 0.4;
    const innerRadius = 0.2;
    const spikes = 5;
    
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        starShape.moveTo(x, y);
      } else {
        starShape.lineTo(x, y);
      }
    }
    starShape.closePath();
    
    const extrudeSettings = {
      steps: 1,
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3
    };
    
    const starGeometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
    const starMaterial = new THREE.MeshPhongMaterial({ 
      color: this.symbolColors.star,
      shininess: 100
    });
    
    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.z = 0.05;
    group.add(star);
    
    // Add shine effect
    const shineGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const shineMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.5
    });
    
    const shine = new THREE.Mesh(shineGeometry, shineMaterial);
    shine.position.set(-0.1, 0.1, 0.2);
    group.add(shine);
  }
  
  /**
   * Get a random symbol name based on probabilities
   */
  getRandomSymbolName() {
    const symbols = Object.keys(CONFIG.symbolProbabilities);
    const weights = Object.values(CONFIG.symbolProbabilities);
    
    // Calculate total weight
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    // Generate random value
    let random = Math.random() * totalWeight;
    
    // Find the symbol based on weight
    for (let i = 0; i < symbols.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return symbols[i];
      }
    }
    
    // Fallback
    return symbols[0];
  }
} 