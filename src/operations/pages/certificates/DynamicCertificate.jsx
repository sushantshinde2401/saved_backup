import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCandidateData } from '../../../shared/hooks/useCandidateData';
import { CERTIFICATE_CONFIG, generateCertificateFields } from '../../../shared/utils/certificateConfig';
import CertificateControls from '../../../shared/components/CertificateControls';
import { useCertificateManager } from '../../../shared/hooks/useCertificateManager';
import { motion, AnimatePresence } from "framer-motion";
import { Save, Plus, Trash2, Type, Search, ChevronDown, ChevronUp, Download, RotateCcw, RotateCw, Layers, Eye, EyeOff } from "lucide-react";
import { FloatingActionButton } from '../../../shared/components/DesignSystem';
import { Stage, Layer, Image as KonvaImage, Text, Transformer } from 'react-konva';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import OperationsNavbar from '../../../shared/components/OperationsNavbar';

function DynamicCertificate() {
  const { certificateType } = useParams();
  const navigate = useNavigate();
  const canvasRefs = useRef([]);
  const thumbRefs = useRef({});
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const imageTransformerRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [allConfigs, setAllConfigs] = useState({});
  const [currentCertType, setCurrentCertType] = useState(certificateType);
  const [savedLayouts, setSavedLayouts] = useState({});

  // Editor states
  const [canvasType, setCanvasType] = useState('verification'); // 'verification' or 'certificate'
  const [textsVerification, setTextsVerification] = useState([]);
  const [textsCertificate, setTextsCertificate] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [editingTextId, setEditingTextId] = useState(null);
  const [showControls, setShowControls] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);

  // Sidebar states
  const [candidateImages, setCandidateImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [loadingImages, setLoadingImages] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Canvas images state
  const [canvasImages, setCanvasImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);

  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Candidate names for dropdown
  const [candidateNames, setCandidateNames] = useState([]);

  // Certificate fields generation
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [expiryYears, setExpiryYears] = useState('');

  // Current texts based on canvas type
  const texts = canvasType === 'verification' ? textsVerification : textsCertificate;
  const setTexts = canvasType === 'verification' ? setTextsVerification : setTextsCertificate;

  // Animation states
  const [animationOffset, setAnimationOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const { candidateData, loading, error } = useCandidateData();
  const config = CERTIFICATE_CONFIG[currentCertType?.toUpperCase()];

  const {
    showRight,
    qrVisible,
    qrUrl,
    isUploading,
    qrPosition,
    qrSize,
    handleDownloadLeft,
    handleDownloadRight,
    handleShowSecond,
    handleGenerateQR,
    handleMouseDown,
    handleResizeStart
  } = useCertificateManager(certificateType?.toUpperCase(), `${certificateType?.toUpperCase()}_VERIFICATION.pdf`);

  // Load selected courses
  useEffect(() => {
    const savedCourses = localStorage.getItem("courses");
    if (savedCourses) {
      setSelectedCourses(JSON.parse(savedCourses));
    }
  }, []);

  // Update current cert type
  useEffect(() => {
    setCurrentCertType(certificateType);
  }, [certificateType]);

  // Clear selections when switching canvas types
  useEffect(() => {
    setSelectedId(null);
    setSelectedImageId(null);
  }, [canvasType]);

  // Load saved layouts
  useEffect(() => {
    const layouts = {};
    const certType = certificateType?.toUpperCase();

    // Load verification layout
    const verificationLayout = localStorage.getItem(`certificate_layout_${certType}_verification`);
    if (verificationLayout) {
      const layout = JSON.parse(verificationLayout);
      layouts.verification = {
        ...layout,
        texts: layout.texts.map(text => ({
          ...text,
          x: text.x / config.dimensions.width,
          y: text.y / config.dimensions.height
        }))
      };
    }

    // Load certificate layout
    const certificateLayout = localStorage.getItem(`certificate_layout_${certType}_certificate`);
    if (certificateLayout) {
      const layout = JSON.parse(certificateLayout);
      layouts.certificate = {
        ...layout,
        texts: layout.texts.map(text => ({
          ...text,
          x: text.x / config.dimensions.width,
          y: text.y / config.dimensions.height
        }))
      };
    }

    setSavedLayouts(layouts);
  }, [certificateType, config]);

  // Load background image for editor
  useEffect(() => {
    if (config) {
      const imageIndex = canvasType === 'verification' ? 0 : 1;
      const img = new window.Image();
      img.src = process.env.PUBLIC_URL + config.backgroundImages[imageIndex];
      img.onload = () => {
        setBackgroundImage(img);
      };
    }
  }, [config, canvasType]);

  // Load text fields for editor
  useEffect(() => {
    if (config) {
      const certType = certificateType?.toUpperCase();
      // First try to load saved layout
      const savedLayout = localStorage.getItem(`certificate_layout_${certType}_${canvasType}`);
      if (savedLayout) {
        const layoutData = JSON.parse(savedLayout);
        // Replace placeholders with actual data if available
        const processedTexts = layoutData.texts.map(textItem => {
          let actualText = textItem.text;

          if (candidateData) {
            // Replace placeholder text with actual candidate data
            switch (textItem.id) {
              case 'fullName':
                actualText = `${candidateData.firstName} ${candidateData.lastName}`;
                break;
              case 'passport':
                actualText = candidateData.passport;
                break;
              case 'nationality':
                actualText = candidateData.nationality;
                break;
              case 'dob':
                actualText = candidateData.dob;
                break;
              case 'cdcNo':
                actualText = candidateData.cdcNo;
                break;
              default:
                // Keep custom text as is
                actualText = textItem.text;
                break;
            }
          }

          return { ...textItem, text: actualText, x: textItem.x / config.dimensions.width, y: textItem.y / config.dimensions.height, draggable: true };
        });
        setTexts(processedTexts);
        return;
      }

      // Fallback to default fields
      const fieldsToUse = canvasType === 'verification' ? config.verificationFields : config.certificateFields;
      const initialTexts = Object.entries(fieldsToUse).map(([fieldName, fieldConfig]) => {
        let text = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);

        // Replace with actual data if available
        if (candidateData) {
          switch (fieldName) {
            case 'fullName':
              text = `${candidateData.firstName} ${candidateData.lastName}`;
              break;
            case 'passport':
              text = candidateData.passport;
              break;
            case 'nationality':
              text = candidateData.nationality;
              break;
            case 'dob':
              text = candidateData.dob;
              break;
            case 'cdcNo':
              text = candidateData.cdcNo;
              break;
          }
        }

        return {
          id: fieldName,
          text: text,
          x: fieldConfig.x / config.dimensions.width,
          y: fieldConfig.y / config.dimensions.height,
          fontSize: fieldConfig.fontSize,
          fill: '#000000',
          draggable: true,
          width: 200,
          height: 30,
        };
      });
      setTexts(initialTexts);
    }
  }, [config, canvasType, certificateType, candidateData, setTexts]);

  // Attach/detach transformer when selection changes
  useEffect(() => {
    if (stageRef.current && transformerRef.current) {
      if (selectedId) {
        const selectedNode = stageRef.current.findOne(`#${selectedId}`);
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode]);
        }
      } else {
        transformerRef.current.nodes([]);
      }
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  // Attach/detach image transformer
  useEffect(() => {
    if (stageRef.current && imageTransformerRef.current) {
      if (selectedImageId) {
        const selectedNode = stageRef.current.findOne(`#${selectedImageId}`);
        if (selectedNode) {
          imageTransformerRef.current.nodes([selectedNode]);
        }
      } else {
        imageTransformerRef.current.nodes([]);
      }
      imageTransformerRef.current.getLayer().batchDraw();
    }
  }, [selectedImageId]);

  // Initialize thumbnail refs
  useEffect(() => {
    thumbRefs.current = selectedCourses.reduce((acc, course) => {
      acc[course] = React.createRef();
      return acc;
    }, {});
  }, [selectedCourses]);

  // Load configs for selected courses
  useEffect(() => {
    const configs = {};
    selectedCourses.forEach(course => {
      const key = course.toUpperCase();
      if (CERTIFICATE_CONFIG[key]) {
        configs[course] = CERTIFICATE_CONFIG[key];
      }
    });
    setAllConfigs(configs);
  }, [selectedCourses]);

  // Fetch candidate names for dropdown
  useEffect(() => {
    fetchCandidateNames();
  }, []);

  const fetchCandidateNames = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/candidate/get-unique-candidate-names');
      setCandidateNames(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch candidate names:', error);
    }
  };

  // Fetch candidate images
  useEffect(() => {
    fetchCandidateImages();
  }, [selectedCandidate, searchTerm]);

  const fetchCandidateImages = async () => {
    setLoadingImages(true);
    try {
      const params = {};
      if (selectedCandidate) params.candidate_name = selectedCandidate;
      if (searchTerm) params.search = searchTerm;
      const response = await axios.get('http://127.0.0.1:5000/candidate/candidate-uploads', { params });
      setCandidateImages(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch candidate images:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  // Initialize history
  useEffect(() => {
    if (history.length === 0) {
      saveToHistory(canvasImages);
    }
  }, [canvasImages]);

  // Render thumbnails
  useEffect(() => {
    Object.entries(allConfigs).forEach(([course, conf]) => {
      const canvas = thumbRefs.current[course]?.current;
      if (canvas && conf.backgroundImages[0]) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = process.env.PUBLIC_URL + encodeURI(conf.backgroundImages[0]);
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.onerror = () => {
          console.error('Failed to load thumbnail image:', conf.backgroundImages[0]);
        };
      }
    });
  }, [allConfigs]);

  // Initialize canvas refs
  useEffect(() => {
    if (config) {
      const len = config.backgroundImages.length;
      if (canvasRefs.current.length !== len) {
        canvasRefs.current = Array(len).fill().map(() => {
          const canvas = document.createElement('canvas');
          canvas.width = 595;
          canvas.height = 842;
          return { current: canvas };
        });
      }
    }
  }, [config]);


  // Animation loop
  useEffect(() => {
    let animationId;
    if (isAnimating) {
      const animate = () => {
        setAnimationOffset(prev => prev + 1); // Move 1 pixel per frame
        animationId = requestAnimationFrame(animate);
      };
      animationId = requestAnimationFrame(animate);
    }
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isAnimating]);

  // Render certificates when data is available or animation updates
  useEffect(() => {
    if (candidateData && config && canvasRefs.current.length > 0) {
      renderCertificates();
    }
  }, [candidateData, config, selectedDate, savedLayouts, animationOffset]);

  const renderCertificates = (isForSave = false) => {
    return Promise.all(config.backgroundImages.map((bgImage, index) => {
      return new Promise((resolve, reject) => {
        const canvas = canvasRefs.current[index]?.current;
        if (!canvas) {
          resolve();
          return;
        }


        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const img = new window.Image();

        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Draw candidate data with appropriate fields for each canvas
          if (candidateData) {
            const fieldsToUse = index === 0 ? config.verificationFields : config.certificateFields;
            const textsToUse = index === 0 ? textsVerification : textsCertificate;
            drawCandidateData(ctx, candidateData, fieldsToUse, index, isForSave, textsToUse);
          }

          // Draw additional data on second canvas if applicable
          if (index === 1 && candidateData && selectedDate) {
            drawAdditionalData(ctx, candidateData, selectedDate);
          }

          // Draw canvas images if in certificate mode and there are images
          if (index === 1 && canvasImages.length > 0) { // Certificate is index 1
            drawCanvasImages(ctx, canvasImages);
          }

          resolve();
        };

        img.onerror = () => {
          console.error('Failed to load image:', bgImage);
          reject(new Error(`Failed to load image: ${bgImage}`));
        };

        img.src = process.env.PUBLIC_URL + encodeURI(bgImage);

        // For cached images, onload may not fire, so check if complete
        if (img.complete) {
          img.onload();
        }
      });
    }));
  };

  const drawCandidateData = (ctx, data, fields, canvasIndex, isForSave = false, texts = []) => {
    const fullName = `${data.firstName} ${data.lastName}`;

    if (texts && texts.length > 0) {
      // Use current texts state
      texts.forEach((textItem) => {
        let value = textItem.text; // Default to text

        // Replace with actual candidate data based on field name
        switch (textItem.id) {
          case 'fullName':
            value = fullName;
            break;
          case 'passport':
            value = data.passport;
            break;
          case 'nationality':
            value = data.nationality;
            break;
          case 'dob':
            value = data.dob;
            break;
          case 'cdcNo':
            value = data.cdcNo;
            break;
          default:
            // Keep the custom text as is
            break;
        }

        ctx.fillStyle = textItem.fill || '#000000';
        ctx.font = `${textItem.fontSize || 16}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top'; // Match Konva Text positioning

        if (isForSave) {
          // Static position for saving
          ctx.fillText(value, textItem.x * ctx.canvas.width, textItem.y * ctx.canvas.height);
        } else {
          // Animate text by moving it horizontally
          const textWidth = ctx.measureText(value).width;
          const startX = textItem.x * ctx.canvas.width;
          const speed = 2; // pixels per frame
          const offset = (animationOffset * speed) % (textWidth + 200); // 200px buffer
          const animatedX = startX - offset;

          ctx.fillText(value, animatedX, textItem.y * ctx.canvas.height);
        }
      });
    } else {
      // Fallback to default config positions
      ctx.fillStyle = '#000000';
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top'; // Match Konva Text positioning

      Object.entries(fields).forEach(([field, config]) => {
        let value = '';
        switch (field) {
          case 'fullName':
            value = fullName;
            break;
          case 'passport':
            value = data.passport;
            break;
          case 'nationality':
            value = data.nationality;
            break;
          case 'dob':
            value = data.dob;
            break;
          case 'cdcNo':
            value = data.cdcNo;
            break;
          default:
            value = data[field] || '';
        }

        ctx.font = `${config.fontSize}px Arial`;

        if (isForSave) {
          // Static position for saving
          ctx.fillText(value, config.x, config.y);
        } else {
          // Animate text by moving it horizontally
          const textWidth = ctx.measureText(value).width;
          const startX = config.x;
          const speed = 2; // pixels per frame
          const offset = (animationOffset * speed) % (textWidth + 200); // 200px buffer
          const animatedX = startX - offset;

          ctx.fillText(value, animatedX, config.y);
        }
      });
    }
  };

  const drawAdditionalData = (ctx, data, date) => {
    // Draw date and other dynamic fields on second canvas
    if (date) {
      ctx.fillStyle = '#000000';
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(date, 180, 260);
    }
  };

  const drawCanvasImages = (ctx, images) => {
    images.forEach(img => {
      ctx.save();
      // Translate to center of image for rotation
      const centerX = img.x * ctx.canvas.width + img.width / 2;
      const centerY = img.y * ctx.canvas.height + img.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((img.rotation || 0) * Math.PI / 180);
      // Draw the image centered at its final size
      ctx.drawImage(img.image, -img.width / 2, -img.height / 2, img.width, img.height);
      ctx.restore();
    });
  };

  // Editor functions
  const handleSelect = (id) => {
    setSelectedId(id);
    setEditingTextId(null);

    // Attach transformer to selected text
    const stage = stageRef.current;
    const selectedNode = stage.findOne(`#${id}`);
    if (selectedNode && transformerRef.current) {
      transformerRef.current.nodes([selectedNode]);
      transformerRef.current.getLayer().batchDraw();
    }
  };

  const handleStageClick = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
      setEditingTextId(null);
      setSelectedImageId(null);

      // Detach transformers
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer().batchDraw();
      }
      if (imageTransformerRef.current) {
        imageTransformerRef.current.nodes([]);
        imageTransformerRef.current.getLayer().batchDraw();
      }
    }
  };

  const handleTextDblClick = (id) => {
    setEditingTextId(id);
  };

  const handleTextChange = (id, newText) => {
    setTexts(texts.map(text =>
      text.id === id ? { ...text, text: newText } : text
    ));
  };

  const addTextField = () => {
    const textContent = prompt('Enter the text for the new field:', 'New Text');
    if (textContent === null) return; // User cancelled

    const newText = {
      id: `text_${Date.now()}`,
      text: textContent,
      x: 100 / config.dimensions.width,
      y: 100 / config.dimensions.height,
      fontSize: 16,
      fill: '#000000',
      draggable: true,
      width: 200,
      height: 30,
    };
    setTexts([...texts, newText]);
  };

  const deleteSelectedText = () => {
    if (selectedId) {
      setTexts(texts.filter(text => text.id !== selectedId));
      setSelectedId(null);
    }
  };

  const saveLayout = () => {
    const certType = certificateType?.toUpperCase();
    const layoutData = {
      canvasType,
      texts: texts.map(({ id, text, x, y, fontSize, fill, width, height }) => {
        // Save with placeholder text, not actual candidate data
        let placeholderText = text;
        switch (id) {
          case 'fullName':
            placeholderText = 'FullName';
            break;
          case 'passport':
            placeholderText = 'Passport';
            break;
          case 'nationality':
            placeholderText = 'Nationality';
            break;
          case 'dob':
            placeholderText = 'DOB';
            break;
          case 'cdcNo':
            placeholderText = 'CDC';
            break;
          default:
            // Keep custom text as is
            placeholderText = text;
            break;
        }
        return { id, text: placeholderText, x: x * config.dimensions.width, y: y * config.dimensions.height, fontSize, fill, width, height };
      }),
      images: canvasImages.map(({ id, x, y, width, height, rotation, originalWidth, originalHeight, keepRatio }) => ({
        id, x: x * config.dimensions.width, y: y * config.dimensions.height, width, height, rotation, scaleX: 1, scaleY: 1, originalWidth, originalHeight, keepRatio
      }))
    };

    localStorage.setItem(`certificate_layout_${certType}_${canvasType}`, JSON.stringify(layoutData));
    alert('Layout saved successfully!');
  };

  const loadLayout = () => {
    const certType = certificateType?.toUpperCase();
    const savedLayout = localStorage.getItem(`certificate_layout_${certType}_${canvasType}`);
    if (savedLayout) {
      const layoutData = JSON.parse(savedLayout);
      setTexts(layoutData.texts.map(text => ({
        ...text,
        x: text.x / config.dimensions.width,
        y: text.y / config.dimensions.height
      })));
      alert('Layout loaded successfully!');
    } else {
      alert('No saved layout found for this certificate and canvas type.');
    }
  };

  const handleFetchName = async () => {
    if (!candidateData || !config) {
      alert('Candidate data or certificate configuration missing');
      return;
    }

    // Validate required fields
    if (!candidateData.firstName || !candidateData.lastName) {
      alert('Candidate first name and last name are required. Please complete the candidate details form.');
      return;
    }

    // Use selectedDate if set, otherwise use current date
    const issueDate = selectedDate || new Date().toISOString().split('T')[0];

    const certificateName = config.name || config.generateName({
      ...candidateData,
      date: issueDate
    });

    try {
      // Capture images by updating layouts and rendering canvases
      const captureImages = async () => {
        const originalType = canvasType;

        // Update layout for verification
        setCanvasType('verification');
        await new Promise(resolve => setTimeout(resolve, 100));
        saveLayout(); // saves current texts for verification

        // Update layout for certificate
        setCanvasType('certificate');
        await new Promise(resolve => setTimeout(resolve, 100));
        saveLayout(); // saves current texts for certificate

        // Render both canvases statically with updated layouts
        await renderCertificates(true);

        // Capture from rendered canvases
        const verificationImageData = canvasRefs.current[0]?.current ? canvasRefs.current[0].current.toDataURL("image/png") : null;
        const certificateImageData = canvasRefs.current[1]?.current ? canvasRefs.current[1].current.toDataURL("image/png") : null;

        // Restore original canvas type
        setCanvasType(originalType);

        return { verificationImageData, certificateImageData };
      };

      const { verificationImageData, certificateImageData } = await captureImages();

      const certificateData = {
        firstName: candidateData.firstName,
        lastName: candidateData.lastName,
        passport: candidateData.passport,
        clientName: candidateData.clientName,
        certificateName: certificateName,
        companyName: "", // Will be set later when B2B customer is selected in invoice process
        // Get rate data from localStorage for amount calculation
        rateData: JSON.parse(localStorage.getItem('courseRates') || '{}'),
        // Include filled certificate images
        verificationImageData: verificationImageData, // Left/verification image
        certificateImageData: certificateImageData    // Right/certificate image if available
      };

      const response = await fetch('http://127.0.0.1:5000/certificate/save-certificate-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(certificateData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[CERTIFICATE] Certificate data with images saved to certificate_selections table:', result);

        if (result.duplicate) {
          alert(`⚠️ Certificate Already Exists!\n\nCandidate: ${candidateData.firstName} ${candidateData.lastName}\nCertificate: ${certificateName}\n\nThis certificate has already been added to the certificate_selections table.`);
        } else {
          alert(`✅ Certificate Added Successfully!\n\nCandidate: ${candidateData.firstName} ${candidateData.lastName}\nCertificate: ${certificateName}\n\nCertificate images saved to certificate_selections table.\nTotal certificates available: ${result.total_certificates}`);

          // Dispatch events for real-time synchronization
          window.dispatchEvent(new CustomEvent('certificateDataUpdated', {
            detail: {
              type: 'certificate_added',
              data: result.data,
              certificateName: certificateName,
              candidateName: `${candidateData.firstName} ${candidateData.lastName}`,
              hasImages: true
            }
          }));
          window.dispatchEvent(new CustomEvent('dataUpdated', {
            detail: {
              type: 'certificate',
              action: 'added',
              data: result.data,
              hasImages: true
            }
          }));
        }
      } else {
        const error = await response.json();
        console.error('[CERTIFICATE] Failed to save certificate data:', error);
        alert(`❌ Failed to save certificate data: ${error.error}`);
      }
    } catch (error) {
      console.error('[CERTIFICATE] Error saving certificate data:', error);
      alert(`Error saving certificate data: ${error.message}`);
    }
  };

  // Image management functions
  const addImageToCanvas = (imageData, x, y) => {
    const img = new window.Image();
    img.src = imageData.data_url;
    img.onload = () => {
      const newImage = {
        id: `canvas_img_${Date.now()}`,
        image: img,
        x: (x || 100) / config.dimensions.width,
        y: (y || 100) / config.dimensions.height,
        width: img.width > 200 ? 200 : img.width,
        height: img.height > 200 ? 200 : img.height,
        originalWidth: img.width,
        originalHeight: img.height,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        keepRatio: true
      };
      const updatedImages = [...canvasImages, newImage];
      setCanvasImages(updatedImages);
      saveToHistory(updatedImages);
    };
  };

  const saveToHistory = (newState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newState]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCanvasImages([...history[historyIndex - 1]]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCanvasImages([...history[historyIndex + 1]]);
    }
  };

  const handleImageSelect = (id) => {
    setSelectedImageId(id);
    setSelectedId(null); // Deselect text
  };

  const deleteSelectedImage = () => {
    if (selectedImageId) {
      const newImages = canvasImages.filter(img => img.id !== selectedImageId);
      setCanvasImages(newImages);
      saveToHistory(newImages);
      setSelectedImageId(null);
    }
  };

  const bringToFront = () => {
    if (selectedImageId) {
      const newImages = [...canvasImages];
      const index = newImages.findIndex(img => img.id === selectedImageId);
      if (index > -1) {
        const [removed] = newImages.splice(index, 1);
        newImages.push(removed);
        setCanvasImages(newImages);
        saveToHistory(newImages);
      }
    }
  };

  const sendToBack = () => {
    if (selectedImageId) {
      const newImages = [...canvasImages];
      const index = newImages.findIndex(img => img.id === selectedImageId);
      if (index > -1) {
        const [removed] = newImages.splice(index, 1);
        newImages.unshift(removed);
        setCanvasImages(newImages);
        saveToHistory(newImages);
      }
    }
  };

  const exportCanvas = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const dataURL = stage.toDataURL({ pixelRatio: 2 }); // High res
    const link = document.createElement('a');
    link.download = 'certificate.png';
    link.href = dataURL;
    link.click();
  };

  const handleGenerateFields = () => {
    try {
      const formatDateToString = (date) => {
        if (!date) return '';
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
      };

      const startDateStr = formatDateToString(startDate);
      const endDateStr = formatDateToString(endDate);

      const fields = generateCertificateFields(startDateStr, endDateStr, parseInt(expiryYears));
      const newTexts = [
        {
          id: 'issueDate',
          text: fields.issueDate,
          x: 100 / config.dimensions.width,
          y: 400 / config.dimensions.height,
          fontSize: 16,
          fill: '#000000',
          draggable: true,
          width: 200,
          height: 30,
        },
        {
          id: 'courseAttended',
          text: fields.courseAttended,
          x: 100 / config.dimensions.width,
          y: 430 / config.dimensions.height,
          fontSize: 16,
          fill: '#000000',
          draggable: true,
          width: 300,
          height: 30,
        },
        {
          id: 'expirationDate',
          text: fields.expirationDate,
          x: 100 / config.dimensions.width,
          y: 460 / config.dimensions.height,
          fontSize: 16,
          fill: '#000000',
          draggable: true,
          width: 200,
          height: 30,
        },
      ];

      // Update existing texts or add new ones
      setTexts(currentTexts => {
        const updatedTexts = [...currentTexts];
        newTexts.forEach(newText => {
          const existingIndex = updatedTexts.findIndex(text => text.id === newText.id);
          if (existingIndex >= 0) {
            // Update existing
            updatedTexts[existingIndex] = { ...updatedTexts[existingIndex], ...newText };
          } else {
            // Add new
            updatedTexts.push(newText);
          }
        });
        return updatedTexts;
      });
    } catch (error) {
      alert(`Error generating fields: ${error.message}`);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const stage = stageRef.current;
    if (!stage || canvasType !== 'certificate') return; // Only allow drops on certificate background

    // Calculate position relative to stage
    const stageBox = stage.container().getBoundingClientRect();
    const scaleX = stage.width() / stageBox.width;
    const scaleY = stage.height() / stageBox.height;
    const x = (e.clientX - stageBox.left) * scaleX;
    const y = (e.clientY - stageBox.top) * scaleY;

    const imageData = JSON.parse(e.dataTransfer.getData('imageData'));
    addImageToCanvas(imageData, x, y);
  };

  if (!config) {
    return <div className="p-6">Certificate type "{certificateType}" not found</div>;
  }

  if (loading) {
    return <div className="p-6">Loading candidate data...</div>;
  }

  if (error) {
    return (
      <div className="p-6 bg-yellow-100 border border-yellow-400 rounded-lg">
        <p className="text-yellow-800">⚠️ {error}</p>
        <p className="text-sm text-yellow-700 mt-2">Please submit candidate information first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Operations Navbar - positioned outside relative container */}
      <OperationsNavbar />

      {/* Portals for date picker calendars */}
      <div id="start-calendar-portal" style={{ position: 'absolute', zIndex: 2000 }}></div>
      <div id="end-calendar-portal" style={{ position: 'absolute', zIndex: 2000 }}></div>

      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-2 sm:p-6 min-h-screen">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Left Sidebar with Thumbnails */}
        {selectedCourses.length > 1 && (
          <div className="fixed top-16 left-0 w-24 bg-white p-2 shadow-xl z-50 overflow-y-auto" style={{height: 'calc(100vh - 4rem)'}}>
            <h3 className="text-xs font-bold text-gray-800 mb-4 text-center">Certificates</h3>
            <div className="space-y-2 flex flex-col items-center">
              {selectedCourses.map((course) => {
                const conf = allConfigs[course];
                if (!conf) return null;
                return (
                  <div
                    key={course}
                    onClick={() => {
                      setCurrentCertType(course.toLowerCase());
                      navigate(`/certificate/${course.toLowerCase()}`);
                    }}
                    className={`cursor-pointer w-16 h-16 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                      currentCertType?.toLowerCase() === course.toLowerCase()
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-gray-200 text-gray-800 border-gray-300'
                    }`}
                    title={course}
                  >
                    {course.replace('&', '').substring(0, 4)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`flex-1 flex flex-col order-1 lg:order-2 ${selectedCourses.length > 1 ? 'ml-24' : ''} ${!sidebarCollapsed ? 'mr-80' : ''}`}>
          {/* Combined Status and Editor Controls */}
          <div className="w-full flex justify-center items-center py-4">
            <div className="mb-4 backdrop-blur-sm rounded-2xl p-4 shadow-xl max-w-4xl w-full">
            {/* Status Display */}
            <div className="mb-4 flex justify-center">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 flex-wrap">
                  <div className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-800">
                    📚 Certificate: {config?.name} - {canvasType === 'verification' ? 'Verification Page' : 'Certificate Page'}
                  </div>
                  <div className="px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-800">
                    ✅ Data loaded: {candidateData?.firstName} {candidateData?.lastName} ({candidateData?.passport})
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCanvasType(canvasType === 'verification' ? 'certificate' : 'verification');
                    setSelectedId(null);
                    setSelectedImageId(null);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Switch to {canvasType === 'verification' ? 'Certificate' : 'Verification'}
                </button>
              </div>
            </div>
            <div className="w-full flex justify-center items-center py-4">
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
              <button
                onClick={addTextField}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Add Text
              </button>
              <button
                onClick={deleteSelectedText}
                disabled={!selectedId}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={16} />
                Delete Selected
              </button>
              <button
                onClick={() => setShowControls(!showControls)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <Type size={16} />
                Text Controls
              </button>
              <button
                onClick={saveLayout}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                Save Layout
              </button>
              <button
                onClick={loadLayout}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Load Layout
              </button>
            </div>
            </div>

            {showControls && selectedId && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Text Properties</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Font Size</label>
                    <input
                      type="number"
                      value={texts.find(t => t.id === selectedId)?.fontSize || 16}
                      onChange={(e) => {
                        const newSize = parseInt(e.target.value);
                        setTexts(texts.map(text =>
                          text.id === selectedId ? { ...text, fontSize: newSize } : text
                        ));
                      }}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Color</label>
                    <input
                      type="color"
                      value={texts.find(t => t.id === selectedId)?.fill || '#000000'}
                      onChange={(e) => {
                        setTexts(texts.map(text =>
                          text.id === selectedId ? { ...text, fill: e.target.value } : text
                        ));
                      }}
                      className="mt-1 block w-full h-10 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-2 p-2 text-center" style={{ zIndex: 2000, position: 'relative' }}>
              <h3 className="text-sm font-semibold mb-1">Generate Certificate Fields</h3>
              <div className="flex flex-col sm:flex-row gap-1 justify-center items-end">
                <div className="relative flex flex-col" style={{ zIndex: 2000 }}>
                  <label className="text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="dd-MM-yyyy"
                    className="block w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholderText="Select start date"
                    portalId="start-calendar-portal"
                  />
                </div>
                <div className="relative flex flex-col" style={{ zIndex: 2000 }}>
                  <label className="text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="dd-MM-yyyy"
                    className="block w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholderText="Select end date"
                    portalId="end-calendar-portal"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-gray-700 mb-1">Expiry Years</label>
                  <select
                    value={expiryYears}
                    onChange={(e) => setExpiryYears(e.target.value)}
                    className="block w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="">Select years</option>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleGenerateFields}
                disabled={!startDate || !endDate || !expiryYears}
                className="mt-2 mx-auto px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Generate Certificate Fields
              </button>
            </div>

            {canvasType === 'certificate' && (
              <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw size={16} />
                  Undo
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCw size={16} />
                  Redo
                </button>
                <button
                  onClick={bringToFront}
                  disabled={!selectedImageId}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Layers size={16} />
                  Front
                </button>
                <button
                  onClick={sendToBack}
                  disabled={!selectedImageId}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Layers size={16} />
                  Back
                </button>
                <button
                  onClick={deleteSelectedImage}
                  disabled={!selectedImageId}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                  Delete Image
                </button>
                <button
                  onClick={exportCanvas}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  Export PNG
                </button>
              </div>
            )}
            </div>
          </div>

          {/* Centered Canvas Container */}
          <div className="w-full flex justify-center items-center py-4">
            {/* Interactive Canvas Display */}
            <div
              className="border-2 border-gray-300 rounded-lg overflow-hidden"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
            <Stage
              width={config.dimensions.width}
              height={config.dimensions.height}
              ref={stageRef}
              onClick={handleStageClick}
              onTap={handleStageClick}
              onTouchStart={handleStageClick}
              className="touch-manipulation"
              style={{
                maxWidth: '100%',
                height: 'auto',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <Layer>
                {/* Background Image */}
                {backgroundImage && (
                  <KonvaImage
                    image={backgroundImage}
                    width={config.dimensions.width}
                    height={config.dimensions.height}
                    onClick={() => {
                      setSelectedId(null);
                      setEditingTextId(null);
                      setSelectedImageId(null);
                    }}
                  />
                )}

                {/* Interactive Text Elements */}
                {texts.map((textItem) => (
                  <Text
                    key={textItem.id}
                    id={textItem.id}
                    text={textItem.text}
                    x={textItem.x * config.dimensions.width}
                    y={textItem.y * config.dimensions.height}
                    fontSize={textItem.fontSize}
                    fill={textItem.fill}
                    draggable={textItem.draggable}
                    onClick={() => handleSelect(textItem.id)}
                    onDblClick={() => handleTextDblClick(textItem.id)}
                    onDragEnd={(e) => {
                      setTexts(texts.map(text =>
                        text.id === textItem.id
                          ? { ...text, x: e.target.x() / config.dimensions.width, y: e.target.y() / config.dimensions.height }
                          : text
                      ));
                    }}
                    onTransformEnd={(e) => {
                      const node = e.target;
                      setTexts(texts.map(text =>
                        text.id === textItem.id
                          ? {
                              ...text,
                              x: node.x() / config.dimensions.width,
                              y: node.y() / config.dimensions.height,
                              width: node.width() * node.scaleX(),
                              height: node.height() * node.scaleY(),
                              fontSize: text.fontSize * node.scaleX()
                            }
                          : text
                      ));
                    }}
                  />
                ))}

                {/* Transformer for selected text */}
                {selectedId && (
                  <Transformer
                    ref={transformerRef}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 5 || newBox.height < 5) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                  />
                )}

                {/* Canvas Images - Only show on certificate background */}
                {canvasType === 'certificate' && canvasImages.map((img) => (
                  <KonvaImage
                    key={img.id}
                    id={img.id}
                    image={img.image}
                    x={img.x * config.dimensions.width}
                    y={img.y * config.dimensions.height}
                    width={img.width}
                    height={img.height}
                    rotation={img.rotation}
                    draggable
                    onClick={() => handleImageSelect(img.id)}
                    onDragEnd={(e) => {
                      const newImages = canvasImages.map(i =>
                        i.id === img.id ? { ...i, x: e.target.x() / config.dimensions.width, y: e.target.y() / config.dimensions.height } : i
                      );
                      setCanvasImages(newImages);
                      saveToHistory(newImages);
                    }}
                    onTransformEnd={(e) => {
                      const node = e.target;
                      const newImages = canvasImages.map(i =>
                        i.id === img.id ? {
                          ...i,
                          x: node.x() / config.dimensions.width,
                          y: node.y() / config.dimensions.height,
                          width: node.width() * node.scaleX(),
                          height: node.height() * node.scaleY(),
                          scaleX: 1,
                          scaleY: 1,
                          rotation: node.rotation()
                        } : i
                      );
                      setCanvasImages(newImages);
                      saveToHistory(newImages);
                      setSelectedImageId(null); // Deselect after resize to hide anchors
                    }}
                  />
                ))}

                {/* Image Transformer - Only show on certificate background */}
                {canvasType === 'certificate' && selectedImageId && (
                  <Transformer
                    ref={imageTransformerRef}
                    enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                    borderEnabled={false}
                    anchorSize={8}
                    anchorFill="blue"
                    anchorStroke="blue"
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 5 || newBox.height < 5) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                  />
                )}
              </Layer>
            </Stage>

            {/* Text Input for Editing */}
            {editingTextId && (() => {
              const editingText = texts.find(t => t.id === editingTextId);
              if (!editingText) return null;

              return (
                <div
                  style={{
                    position: 'absolute',
                    top: editingText.y * config.dimensions.height + 10,
                    left: editingText.x * config.dimensions.width + 10,
                    zIndex: 1000,
                  }}
                >
                  <input
                    type="text"
                    value={editingText.text}
                    onChange={(e) => handleTextChange(editingTextId, e.target.value)}
                    onBlur={() => setEditingTextId(null)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        setEditingTextId(null);
                      }
                    }}
                    className="px-3 py-2 border border-blue-500 rounded text-base sm:text-sm bg-white shadow-lg min-w-[200px] sm:min-w-[150px]"
                    style={{
                      fontSize: `${Math.max(editingText.fontSize - 2, 14)}px`,
                    }}
                    autoFocus
                  />
                </div>
              );
            })()}
            </div>
          </div>

          {/* Final Action Controls */}
          <div className="mt-4 lg:mt-6 flex justify-center px-2 sm:px-4">
            <div className="w-full max-w-md">
              <CertificateControls
                onFetchName={handleFetchName}
              />
            </div>
          </div>
        </div>

       {/* Right Sidebar for Candidate Images */}
       {!sidebarCollapsed && (
         <div className="fixed top-16 right-0 w-80 bg-white p-4 shadow-xl z-50 overflow-y-auto" style={{height: 'calc(100vh - 4rem)'}}>
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-bold text-gray-800">Candidate Images</h3>
             <button onClick={() => setSidebarCollapsed(true)} className="p-1 hover:bg-gray-100 rounded">
               <ChevronDown size={16} />
             </button>
           </div>

           {/* Dropdown for candidate */}
           <div className="mb-4">
             <label className="block text-sm font-medium text-gray-700 mb-1">Candidate</label>
             <select
               value={selectedCandidate}
               onChange={(e) => setSelectedCandidate(e.target.value)}
               className="w-full px-3 py-2 border border-gray-300 rounded-md"
             >
               <option value="">All Candidates</option>
               {candidateNames.map(name => (
                 <option key={name} value={name}>{name}</option>
               ))}
             </select>
           </div>

           {/* Search */}
           <div className="mb-4">
             <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
             <div className="relative">
               <Search size={16} className="absolute left-3 top-3 text-gray-400" />
               <input
                 type="text"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Search images..."
                 className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
               />
             </div>
           </div>

           {/* Thumbnails */}
           <div>
              {loadingImages ? (
                <div className="text-center py-4">Loading...</div>
              ) : candidateImages.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No images found</div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {candidateImages.map(img => (
                    <div
                      key={img.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('imageData', JSON.stringify(img));
                      }}
                      onClick={() => {
                        // For mobile: tap to add image to canvas
                        if (window.innerWidth < 768) { // Mobile breakpoint
                          addImageToCanvas(img, 100, 100);
                        }
                      }}
                      className="border rounded-lg overflow-hidden cursor-move hover:shadow-md transition-shadow touch-manipulation"
                      title={window.innerWidth < 768 ? "Tap to add to certificate" : "Drag to add to certificate"}
                    >
                      <img src={img.data_url} alt={img.file_name} className="w-full h-20 object-cover" />
                      <div className="text-xs p-1 bg-gray-50 truncate">{img.file_name}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Mobile help text */}
              <div className="text-center text-sm text-gray-500 mt-4 lg:hidden">
                Tap images above to add to certificate
              </div>
            </div>
          </div>
        )}

        {/* Collapsed sidebar button */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="fixed right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 shadow-xl hover:bg-gray-100 transition-colors z-10"
          >
            <ChevronUp size={16} />
          </button>
        )}
        </div>
      </div>
    </div>
  );
}

export default DynamicCertificate;