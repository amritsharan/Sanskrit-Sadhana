export interface Shloka {
    id: string;
    title: string;
    source: string;
    text: string;
    transliteration: string;
    meaning: string;
    audioUrl?: string;
}

export const SHLOKAS: Shloka[] = [
    {
        id: "gita-2-47",
        title: "Bhagavad Gita 2.47",
        source: "Bhagavad Gita",
        text: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
        transliteration: "karmaṇyevādhikāraste mā phaleṣu kadācana |\nmā karmaphalaheturbhūrmā te saṅgo'stvakarmaṇi ||",
        meaning: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions.",
        audioUrl: "https://www.holy-bhagavad-gita.org/public/audio/002_047.mp3"
    },
    {
        id: "gayatri",
        title: "Gayatri Mantra",
        source: "Rigveda",
        text: "ॐ भूर्भुवः स्वः ।\nतत्सवितुर्वरेण्यं ।\nभर्गो देवस्य धीमहि ।\nधियो यो नः प्रचोदयात् ॥",
        transliteration: "om bhūr bhuvaḥ svaḥ |\ntat savitur vareṇyaṃ |\nbhargo devasya dhīmahi |\ndhiyo yo naḥ pracodayāt ||",
        meaning: "O Divine Mother, may your pure divine light illuminate our intellect and occupy our entire being.",
        audioUrl: "https://www.sanskrit-trikashaivism.com/audio/gayatri-mantra.mp3"
    },
    {
        id: "gita-2-62",
        title: "Bhagavad Gita 2.62",
        source: "Bhagavad Gita",
        text: "ध्यायतो विषयान्पुंस: सङ्गस्तेषूपजायते |\nसङ्गात्सञ्जायते काम: कामात्क्रोधोऽभिजायते ||",
        transliteration: "dhyāyato viṣayān puṃsaḥ saṅgas teṣūpajāyate |\nsaṅgāt sañjāyate kāmaḥ kāmāt krodho'bhijāyate ||",
        meaning: "While contemplating the objects of the senses, a person develops attachment for them, and from such attachment lust develops, and from lust anger arises.",
        audioUrl: "https://www.holy-bhagavad-gita.org/public/audio/002_062.mp3"
    },
    {
        id: "asato-ma",
        title: "Asato Ma Sadgamaya",
        source: "Brihadaranyaka Upanishad",
        text: "असतो मा सद्गमय ।\nतमसो मा ज्योतिर्गमय ।\nमृत्योर्मा अमृतं गमय ॥",
        transliteration: "asato mā sadgamaya |\ntamaso mā jyotirgamaya |\nmṛtyormā amṛtaṃ gamaya ||",
        meaning: "Lead me from the unreal to the real. Lead me from darkness to light. Lead me from death to immortality."
    },
    {
        id: "sarve-bhavantu",
        title: "Sarve Bhavantu Sukhinah",
        source: "Brihadaranyaka Upanishad",
        text: "सर्वे भवन्तु सुखिनः\nसर्वे सन्तु निरामयाः ।\nसर्वे भद्राणि पश्यन्तु\nमा कश्चिद्दुःखभाग्भवेत् ॥",
        transliteration: "sarve bhavantu sukhinaḥ\nsarve santu nirāmayāḥ |\nsarve bhadrāṇi paśyantu\nmā kaścid duḥkhabhāgbhavet ||",
        meaning: "May everyone be happy, may everyone be free from all diseases or suffering, may everyone see what is good and may no one undergo misery or be an object of grief."
    },
    {
        id: "gita-4-7",
        title: "Bhagavad Gita 4.7",
        source: "Bhagavad Gita",
        text: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत |\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम् ||",
        transliteration: "yadā yadā hi dharmasya glānir bhavati bhārata |\nabhyutthānam adharmasya tadātmānaṃ sṛjāmy aham ||",
        meaning: "Whenever there is a decline in righteousness and an increase in unrighteousness, O Bharata, I manifest myself."
    },
    {
        id: "gita-6-5",
        title: "Bhagavad Gita 6.5",
        source: "Bhagavad Gita",
        text: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत् |\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मन: ||",
        transliteration: "uddhared ātmanātmānaṃ nātmānam avasādayet |\nātmaiva hy ātmano bandhur ātmaiva ripur ātmanaḥ ||",
        meaning: "Elevate yourself through your own effort, and do not degrade yourself. For the mind is the friend of the soul, and the mind is also the enemy of the soul."
    },
    {
        id: "subhashita-1",
        title: "Vidya Dadati Vinayam",
        source: "Hitopadesha",
        text: "विद्या ददाति विनयं विनयाद्याति पात्रताम् |\nपात्रत्वाद्धनमाप्नोति धनाद्धर्मं ततः सुखम् ॥",
        transliteration: "vidyā dadāti vinayaṃ vinayād yāti pātratām |\npātratvād dhanam āpnoti dhanād dharmaṃ tataḥ sukham ||",
        meaning: "Knowledge gives humility, from humility comes merit, from merit one attains wealth, from wealth righteousness, and from that comes happiness."
    },
    {
        id: "gita-9-27",
        title: "Bhagavad Gita 9.27",
        source: "Bhagavad Gita",
        text: "यत्करोषि यदश्नासि यज्जुहोषि ददासि यत् |\nयत्तपस्यसि कौन्तेय तत्कुरुष्व मदर्पणम् ||",
        transliteration: "yat karoṣi yad aśnāsi yaj juhoṣi dadāsi yat |\nyat tapasyasi kaunteya tat kuruṣva mad-arpaṇam ||",
        meaning: "Whatever you do, whatever you eat, whatever you offer as oblation, whatever you give in charity, and whatever penance you perform, O Kaunteya, do that as an offering to me."
    },
    {
        id: "ganesha-shloka",
        title: "Ganesha Shloka",
        source: "Traditional",
        text: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ |\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ||",
        transliteration: "vakratuṇḍa mahākāya sūryakoṭi samaprabha |\nnirvighnaṃ kuru me deva sarvakāryeṣu sarvadā ||",
        meaning: "O Lord with a curved trunk and a huge body, whose radiance is like a billion suns, please make all my works free of obstacles, always."
    },
    {
        id: "shri-guru",
        title: "Guru Stotram",
        source: "Guru Gita",
        text: "गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः |\nगुरुः साक्षात् परब्रह्म तस्मै श्रीगुरवे नमः ॥",
        transliteration: "gururbrahmā gururviṣṇuḥ gururdevo maheśvaraḥ |\nguruḥ sākṣāt parabrahma tasmai śrīgurave namaḥ ||",
        meaning: "Guru is Brahma, Guru is Vishnu, Guru is Lord Maheshwara. Guru is verily the Supreme Brahman. Salutations to that Sri Guru."
    },
    {
        id: "sahana-vavatu",
        title: "Shanti Mantra",
        source: "Kathopanishad",
        text: "ॐ सह नाववतु | सह नौ भुनक्तु | सह वीर्यं करवावहै |\nतेजस्वि नावधीतमस्तु मा विद्विषावहै || ॐ शान्तिः शान्तिः शान्तिः ||",
        transliteration: "om saha nāvavatu | saha nau bhunaktu | saha vīryaṃ karavāvahai |\ntejasvi nāvadhītam astu mā vidviṣāvahai || om śāntiḥ śāntiḥ śāntiḥ ||",
        meaning: "May He protect us both together; may He nourish us both together; may we work with great energy together; may our study be vigorous and effective; may we not hate each other. Om Peace, Peace, Peace."
    },
    {
        id: "gita-18-66",
        title: "Bhagavad Gita 18.66",
        source: "Bhagavad Gita",
        text: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज |\nअहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुच: ||",
        transliteration: "sarva-dharmān parityajya mām ekaṃ śaraṃ vraja |\nahaṃ tvāṃ sarva-pāpebhyo mokṣayiṣyāmi mā śucaḥ ||",
        meaning: "Abandoning all forms of dharma, take refuge in me alone. I will liberate you from all sins; do not grieve."
    },
    {
        id: "vidya-shloka",
        title: "Vidya Shloka",
        source: "Subhashita",
        text: "न चोरहार्यं न च राजहार्यं न भ्रातृभाज्यं न च भारकारि |\nव्यये कृते वर्धत एव नित्यं विद्याधनं सर्वधनप्रधानम् ||",
        transliteration: "na corahāryaṃ na ca rājahāryaṃ na bhrātrubhājyaṃ na ca bhārakāri |\nvyaye kṛte vardhata eva nityaṃ vidyādhanaṃ sarvadhanapradhānam ||",
        meaning: "It cannot be stolen by thieves, nor taken away by kings, nor partitioned by brothers, nor is it a burden. It only increases with use; the wealth of knowledge is the supreme among all forms of wealth."
    },
    {
        id: "saraswati",
        title: "Saraswati Vandana",
        source: "Traditional",
        text: "या कुन्देन्दुतुषारहारधवला या शुभ्रवस्त्रावृता |\nया वीणावरदण्डमण्डितकरा या श्वेतपद्मासना ||",
        transliteration: "yā kundendutuṣārahāradhavalā yā śubhravastrāvṛtā |\nyā vīṇāvaradaṇḍamaṇḍitakarā yā śvetapadmāsanā ||",
        meaning: "Salutations to Goddess Saraswati, who is white like the jasmine flower, the moon, and a garland of dew drops; who is draped in white garments; whose hands are adorned with the Veena and the boon-giving staff; and who is seated on a white lotus."
    },
    {
        id: "peace-prayer",
        title: "Vishwa Shanti",
        source: "Vedas",
        text: "स्वस्ति प्रजाभ्यः परिपालयन्तां\nन्यायेन मार्गेण महीं महीशाः ।\nगोब्राह्मणेभ्यः शुभमस्तु नित्यं\nलोकाः समस्ताः सुखिनो भवन्तु ॥",
        transliteration: "svasti prajābhyaḥ paripālayantāṃ\nnyāyena mārgeṇa mahīṃ mahīśāḥ |\ngobrāhmaṇebhyaḥ śubhamastu nityaṃ\nlokāḥ samastāḥ sukhino bhavantu ||",
        meaning: "May there be happiness for all people; may the rulers protect the world in a lawful manner; may there be always good for cows and intellectuals; may all the worlds be happy."
    },
    {
        id: "morning-prayer",
        title: "Karagre Vasate Lakshmi",
        source: "Traditional",
        text: "कराग्रे वसते लक्ष्मीः करमध्ये सरस्वती ।\nकरमूले तु गोविन्दः प्रभाते करदर्शनम् ॥",
        transliteration: "karāgre vaṣate lakṣmīḥ karamadhye sarasvatī |\nkaramūle tu govindaḥ prabhāte karadarśanam ||",
        meaning: "At the tip of the hand resides Lakshmi, in the middle resides Saraswati, and at the base of the hand resides Govinda. Looking at the palm in the morning is auspicious."
    },
    {
        id: "annapurna",
        title: "Annapurna Shloka",
        source: "Traditional",
        text: "अन्नपूर्णे सदापूर्णे शङ्करप्राणवल्लभे |\nज्ञानवैराग्यसिद्ध्यर्थं भिक्षां देहि च पार्वति ||",
        transliteration: "annapūrṇe sadāpūrṇe śaṅkaraprāṇavallabhe |\njñānavairāgyasiddhyarthaṃ bhikṣāṃ dehi ca pārvati ||",
        meaning: "O Annapurna, forever complete, beloved of Shankara, give me alms for the attainment of knowledge and detachment, O Parvati."
    },
    {
        id: "deepam",
        title: "Deepa Jyoti",
        source: "Traditional",
        text: "दीपज्योतिः परब्रह्म दीपज्योतिर्जनार्दनः |\nदीपो हरतु मे पापं दीपज्योतिर्नमोऽस्तु ते ||",
        transliteration: "dīpajyotiḥ parabrahma dīpajyotirjanārdanaḥ |\ndīpo haratu me pāpaṃ dīpajyotinamo'stu te ||",
        meaning: "The light of the lamp is supreme Brahman. The light of the lamp is Janardana. May the lamp destroy my sins. Salutations to the light of the lamp."
    },
    {
        id: "parame-shwara",
        title: "Tvameva Mata",
        source: "Traditional",
        text: "त्वमेव माता च पिता त्वमेव\nत्वमेव बन्धुश्च सखा त्वमेव |\nत्वमेव विद्या द्रविणं त्वमेव\nत्वमेव सर्वं मम देव देव ||",
        transliteration: "tvameva mātā ca pitā tvameva\ntvameva bandhuśca sakhā tvameva |\ntvameva vidyā draviṇaṃ tvameva\ntvameva sarvaṃ mama deva deva ||",
        meaning: "You alone are my mother and you alone are my father, you alone are my relative and you alone are my friend, you alone are my knowledge and you alone are my wealth, you alone are my everything, O God of gods."
    },
    {
        id: "kalabhairava",
        title: "Kalabhairava Ashtakam",
        source: "Adi Shankara",
        text: "देवराजसेव्यमानपावनाङ्घ्रिपङ्कजं\nव्यालयज्ञसूत्रमिन्दुशेखरं कृपाकरम् |\nनारदादियोगिवृन्दवन्दितं दिगम्बरं\nकाशिकापुराधिनाथकालभैरवं भजे ॥",
        transliteration: "devarājasevyamānapāvanāṅghripaṅkajaṃ\nvyālayajñasūtramindusekharaṃ kṛpākaram |\nnāradādiyogivṛndavanditaṃ digambaraṃ\nkāśikāpurādhināthakālabhairavaṃ bhaje ||",
        meaning: "I salute the Lord of Kashi, Kalabhairava, whose feet are worshipped by Indra, who wears a snake as a sacred thread, who has the moon on his head, who is compassionate, and who is praised by Narada and other yogis."
    },
    {
        id: "dakshinamurti",
        title: "Dakshinamurti Shloka",
        source: "Adi Shankara",
        text: "मौनव्याख्याप्रकटितपरब्रह्मतत्त्वं युवानं\nवर्षिष्ठान्तेवसद्युषिगणैरावृतं ब्रह्मनिष्ठैः |\nआचार्येन्द्रं करकलितचिन्मुद्रमानन्दरूपं\nस्वात्मारामं मुदितवदनं दक्षिणामूर्तिमीडे ॥",
        transliteration: "maunavyākhyāprakaṭitaparabrahmatattvaṃ yuvānaṃ\nvarṣiṣṭhāntevasadyuṣigaṇairāvṛtaṃ brahmaniṣṭhaiḥ |\nācāryendraṃ karakalitacinmudramānandarūpaṃ\nsvātmārāmaṃ muditavadanaṃ dakṣiṇāmūrtimīḍe ||",
        meaning: "I praise Lord Dakshinamurti, who expounds the truth of Brahman through silence, who is young, surrounded by elderly disciples established in Brahman, the foremost of teachers, whose hand shows the cin-mudra, who is the embodiment of bliss, reveling in self, with a joyful face."
    },
    {
        id: "rama-stotram",
        title: "Rama Raksha",
        source: "Traditional",
        text: "श्रीराम राम रमेति रमे रामे मनोरमे |\nसहस्रनाम तत्तुल्यं रामनाम वरानने ||",
        transliteration: "śrīrāma rāma rameti rame rāme manorame |\nsahasranāma tattulyaṃ rāmanāma varānane ||",
        meaning: "Lord Shiva said to Parvati: O my darling, chanting the name of Rama is like chanting the thousand names of Vishnu."
    },
    {
        id: "dhyana-shloka",
        title: "Shuklam Bharadharam",
        source: "Traditional",
        text: "शुक्लाम्बरधरं विष्णुं शशिवर्णं चतुर्भुजम् |\nप्रसन्नवदनं ध्यायेत् सर्वविघ्नोपशान्तये ||",
        transliteration: "śuklāmbaradharaṃ viṣṇuṃ śasivarṇaṃ caturbhujam |\nprasannavadanaṃ dhyāyet sarvavighnopaśāntaye ||",
        meaning: "Salutations to the omnipresent Lord Ganesha, who is dressed in white, is as bright as the moon, has four arms, and a joyful face; may he remove all obstacles from our path."
    },
    {
        id: "durga-devi",
        title: "Sarva Mangala Mangalye",
        source: "Devi Mahatmya",
        text: "सर्वमङ्गलमङ्गल्ये शिवे सर्वार्थसाधिके |\nशरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते ||",
        transliteration: "sarvamaṅgalamāṅgalye śive sarvārthasāधिके |\nśaraṇye tryambake gauri nārāyaṇi namo'stu te ||",
        meaning: "To the most auspicious among the auspicious, the consort of Shiva, who bestows all goals; our refuge, the three-eyed one, Gauri, Narayani, we salute thee."
    },
    {
        id: "lingashtakam",
        title: "Lingashtakam",
        source: "Traditional",
        text: "ब्रह्ममुरारिसुरार्चितलिङ्गं\nनिर्मलभासितशोभितलिङ्गम् |\nजन्मजदुःखविनाशकलिङ्गं\nतत्प्रणमामि सदाशिवलिङ्गम् ॥",
        transliteration: "brahmamurārisurārcitalingaṃ\nnirmalabhāsitaśobhitalingam |\njanmajaduḥkhavināśakalingaṃ\ntat praṇamāmi sadāśivalingam ||",
        meaning: "I salute that Sadasiva Lingam, which is worshipped by Brahma, Vishnu, and the gods, which is pure and shining, and which destroys the sorrows of birth."
    },
    {
        id: "gayatri-shanti",
        title: "Pavamana Mantra",
        source: "Brihadaranyaka Upanishad",
        text: "ॐ पूर्णमदः पूर्णमिदं पूर्णात् पूर्णमुदच्यते |\nपूर्णस्य पूर्णमादाय पूर्णमेवावशिष्यते ||",
        transliteration: "om pūrṇamadaḥ pūrnāmidaṃ pūrṇāt pūrṇamudacyate |\npūrṇasya pūrṇamādāya pūrṇamevāvaśiṣyate ||",
        meaning: "That is perfect; this is perfect. From perfection, perfection arises. Even after perfection is taken from perfection, perfection still remains."
    },
    {
        id: "hanuman",
        title: "Hanuman Chalisa Snippet",
        source: "Tulsidas",
        text: "बुद्धिहीन तनु जानिके सुमिरौं पवनकुमार |\nबल बुद्धि विद्या देहु मोहिं हरहु कलेश विकार ||",
        transliteration: "buddhihīna tanu jānike sumirauṃ pavanakumāra |\nbala buddhi vidyā dehu mohiṃ harahu kaleśa vikāra ||",
        meaning: "Considering myself to be ignorant, I meditate upon you, O son of the wind. Please grant me strength, wisdom, and knowledge, and remove my miseries and flaws."
    },
    {
        id: "shivaya",
        title: "Panchakshara Mantra",
        source: "Yajurveda",
        text: "ॐ नमः शिवाय ॥",
        transliteration: "om namaḥ śivāya ||",
        meaning: "Salutations to Lord Shiva."
    },
    {
        id: "mahamrityunjaya",
        title: "Mahamrityunjaya Mantra",
        source: "Rigveda",
        text: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् |\nउर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात् ||",
        transliteration: "om tryambakaṃ yajāmahe sugandhiṃ puṣṭivardhanam |\nurvārukamiva bandhanān mṛtyormukṣīya māmṛtāt ||",
        meaning: "We worship the three-eyed Lord, who is fragrant and who nourishes all beings. May he liberate us from death for the sake of immortality, just as the ripe cucumber is freed from its bondage to the vine."
    }
];
