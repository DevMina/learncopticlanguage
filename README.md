# Coptic Learning - HTML/JS/CSS Version

A static HTML version of the Coptic Learning website, converted from ASP.NET Core to pure HTML, JavaScript, and CSS for hosting on Netlify.

## Features

- **Bilingual Support**: Arabic and English language switching
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Interactive Learning**: 
  - Coptic alphabet with pronunciation
  - Numbers, colors, animals, fruits vocabulary
  - Common words and phrases
  - Grammar rules
  - Religious texts
  - Interactive dictionary/translator
- **Audio Support**: Sound files for pronunciation
- **Coptic Keyboard**: Virtual keyboard for typing Coptic characters
- **Modern UI**: Clean, professional design using Bootstrap 5

## Project Structure

```
CopticLearning-HTML/
├── index.html              # Main homepage
├── intro.html              # Introduction to Coptic language
├── letters.html            # Coptic alphabet overview
├── letter-*.html           # Individual letter pages
├── numbers.html            # Numbers in Coptic
├── colors.html             # Colors in Coptic
├── animals.html            # Animals in Coptic
├── fruits.html             # Fruits in Coptic
├── words.html              # Common Coptic words
├── phrases.html            # Common Coptic phrases
├── rules.html              # Grammar rules
├── texts.html              # Religious texts
├── translator.html         # Dictionary/translator
├── css/
│   └── site.css            # Main stylesheet
├── js/
│   ├── site.js             # Main JavaScript functionality
│   ├── language.js         # Language switching
│   └── translator.js       # Dictionary functionality
├── fonts/                 # Coptic fonts
├── sounds/                # Audio files
├── assets/                # Additional assets
├── netlify.toml           # Netlify configuration
└── README.md              # This file
```

## Deployment to Netlify

1. **Create a Netlify Account**: Sign up at [netlify.com](https://netlify.com)

2. **Connect Repository**:
   - Push this code to a Git repository (GitHub, GitLab, or Bitbucket)
   - In Netlify dashboard, click "New site from Git"
   - Connect your repository

3. **Configure Build Settings**:
   - Build command: Leave empty (no build needed)
   - Publish directory: `.` (root directory)
   - Netlify will automatically detect the `netlify.toml` configuration

4. **Deploy**: Click "Deploy site" - your site will be live!

## Features Details

### Language Switching
- Arabic (RTL) and English (LTR) support
- Persistent language preference using localStorage
- Automatic direction switching for proper display

### Dictionary/Translator
- Search Coptic, Arabic, or English words
- Virtual Coptic keyboard for easy input
- 30+ sample words with translations
- Responsive search results

### Audio Support
- Pronunciation files for letters, words, and phrases
- Click-to-play audio buttons
- Organized file structure for easy management

### Responsive Design
- Mobile-first approach
- Bootstrap 5 grid system
- Custom CSS for Coptic text display
- Optimized for all screen sizes

## Customization

### Adding New Words to Dictionary
Edit `js/translator.js` and add to the `copticDictionary` array:

```javascript
{ 
    coptic: "NewWord", 
    pronunciation: "NewWord", 
    arabic: "ترجمة عربية", 
    english: "English translation", 
    englishPronunciation: "english-pronunciation" 
}
```

### Adding New Audio Files
1. Place audio files in the `sounds/` directory
2. Use the playSound() function: `playSound('path/to/file.m4a')`

### Styling
- Main styles in `css/site.css`
- Coptic fonts in `fonts/` directory
- Bootstrap 5 for responsive layout

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance

- Optimized CSS and JavaScript
- Lazy loading for images
- Efficient audio loading
- Minimal dependencies

## Security

- Content Security Policy headers
- XSS protection
- Secure headers configuration in `netlify.toml`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project maintains the same license as the original Coptic Learning project.

## Support

For issues or questions:
- Check the original project documentation
- Create an issue in the repository
- Contact the development team

---

**Note**: This static version maintains all the functionality of the original ASP.NET Core application while being easily deployable to any static hosting service.
