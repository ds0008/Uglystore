const bdAddresses = [
  {
    division: "Dhaka",
    districts: [
      { name: "Dhaka", upazilas: [
        { name: "Dhanmondi", thanas: ["Dhanmondi", "Hazaribagh", "Jigatala"] },
        { name: "Mirpur", thanas: ["Mirpur", "Pallabi", "Rupnagar", "Shah Ali"] },
        { name: "Gulshan", thanas: ["Gulshan", "Banani", "Mohakhali", "Niketan"] },
        { name: "Uttara", thanas: ["Uttara East", "Uttara West", "Uttara Model Town"] },
        { name: "Motijheel", thanas: ["Motijheel", "Paltan", "Kakrail"] },
        { name: "Tejgaon", thanas: ["Tejgaon", "Farmgate", "Kawran Bazar"] },
        { name: "Mohammadpur", thanas: ["Mohammadpur", "Adabar", "Lalmatia"] },
        { name: "Savar", thanas: ["Savar", "Ashulia", "Dhamsona", "Hemayetpur"] },
        { name: "Tongi", thanas: ["Tongi East", "Tongi West"] },
        { name: "Keraniganj", thanas: ["Keraniganj", "South Keraniganj"] },
        { name: "Demra", thanas: ["Demra", "Matuail"] },
        { name: "Jatrabari", thanas: ["Jatrabari", "Postogola"] },
        { name: "Wari", thanas: ["Wari", "Bashabo", "Narinda"] },
        { name: "Lalbagh", thanas: ["Lalbagh", "Chawk Bazar"] },
        { name: "Dohar", thanas: ["Dohar", "Nawabganj"] },
        { name: "Nawabganj", thanas: ["Nawabganj", "Fatullah"] },
      ]},
      { name: "Gazipur", upazilas: [
        { name: "Gazipur Sadar", thanas: ["Gazipur Sadar", "Basan", "Joydebpur"] },
        { name: "Kaliakair", thanas: ["Kaliakair", "Baroipara"] },
        { name: "Kaliganj", thanas: ["Kaliganj", "Pubail"] },
        { name: "Kapasia", thanas: ["Kapasia", "Raipur"] },
        { name: "Sreepur", thanas: ["Sreepur", "Mawna"] },
      ]},
      { name: "Narayanganj", upazilas: [
        { name: "Narayanganj Sadar", thanas: ["Narayanganj Sadar", "Fatullah"] },
        { name: "Araihazar", thanas: ["Araihazar"] },
        { name: "Sonargaon", thanas: ["Sonargaon", "Kanchan"] },
        { name: "Rupganj", thanas: ["Rupganj", "Bhulta"] },
        { name: "Bandar", thanas: ["Bandar"] },
      ]},
      { name: "Tangail", upazilas: [
        { name: "Tangail Sadar", thanas: ["Tangail Sadar"] },
        { name: "Mirzapur", thanas: ["Mirzapur"] },
        { name: "Madhupur", thanas: ["Madhupur"] },
        { name: "Gopalpur", thanas: ["Gopalpur"] },
        { name: "Sakhipur", thanas: ["Sakhipur"] },
      ]},
      { name: "Manikganj", upazilas: [
        { name: "Manikganj Sadar", thanas: ["Manikganj Sadar"] },
        { name: "Singair", thanas: ["Singair"] },
        { name: "Saturia", thanas: ["Saturia"] },
      ]},
      { name: "Munshiganj", upazilas: [
        { name: "Munshiganj Sadar", thanas: ["Munshiganj Sadar"] },
        { name: "Gazaria", thanas: ["Gazaria"] },
        { name: "Sreenagar", thanas: ["Sreenagar"] },
      ]},
      { name: "Narsingdi", upazilas: [
        { name: "Narsingdi Sadar", thanas: ["Narsingdi Sadar"] },
        { name: "Raipura", thanas: ["Raipura"] },
        { name: "Belabo", thanas: ["Belabo"] },
      ]},
      { name: "Faridpur", upazilas: [
        { name: "Faridpur Sadar", thanas: ["Faridpur Sadar"] },
        { name: "Boalmari", thanas: ["Boalmari"] },
        { name: "Madhukhali", thanas: ["Madhukhali"] },
      ]},
      { name: "Gopalganj", upazilas: [
        { name: "Gopalganj Sadar", thanas: ["Gopalganj Sadar"] },
        { name: "Tungipara", thanas: ["Tungipara"] },
        { name: "Kotalipara", thanas: ["Kotalipara"] },
      ]},
      { name: "Kishoreganj", upazilas: [
        { name: "Kishoreganj Sadar", thanas: ["Kishoreganj Sadar"] },
        { name: "Bhairab", thanas: ["Bhairab"] },
        { name: "Bajitpur", thanas: ["Bajitpur"] },
      ]},
      { name: "Madaripur", upazilas: [
        { name: "Madaripur Sadar", thanas: ["Madaripur Sadar"] },
        { name: "Rajoir", thanas: ["Rajoir"] },
      ]},
      { name: "Rajbari", upazilas: [
        { name: "Rajbari Sadar", thanas: ["Rajbari Sadar"] },
        { name: "Goalandaghat", thanas: ["Goalandaghat"] },
      ]},
      { name: "Shariatpur", upazilas: [
        { name: "Shariatpur Sadar", thanas: ["Shariatpur Sadar"] },
        { name: "Gosairhat", thanas: ["Gosairhat"] },
      ]},
    ],
  },
  {
    division: "Chattogram",
    districts: [
      { name: "Chattogram", upazilas: [
        { name: "Kotwali", thanas: ["Kotwali", "Pahartali", "Panchlaish"] },
        { name: "Halishahar", thanas: ["Halishahar", "Agrabad"] },
        { name: "Double Mooring", thanas: ["Double Mooring", "Firingee Bazaar"] },
        { name: "Patenga", thanas: ["Patenga", "South Patenga"] },
        { name: "Sitakunda", thanas: ["Sitakunda", "Kumira"] },
        { name: "Mirsharai", thanas: ["Mirsharai"] },
        { name: "Sandwip", thanas: ["Sandwip"] },
        { name: "Fatikchhari", thanas: ["Fatikchhari"] },
        { name: "Hathazari", thanas: ["Hathazari"] },
      ]},
      { name: "Cox's Bazar", upazilas: [
        { name: "Cox's Bazar Sadar", thanas: ["Cox's Bazar Sadar"] },
        { name: "Teknaf", thanas: ["Teknaf"] },
        { name: "Ukhia", thanas: ["Ukhia"] },
        { name: "Ramu", thanas: ["Ramu"] },
        { name: "Maheshkhali", thanas: ["Maheshkhali"] },
      ]},
      { name: "Comilla", upazilas: [
        { name: "Comilla Sadar", thanas: ["Comilla Sadar", "Comilla Sadar Dakshin"] },
        { name: "Brahmanpara", thanas: ["Brahmanpara"] },
        { name: "Debidwar", thanas: ["Debidwar"] },
        { name: "Laksam", thanas: ["Laksam"] },
        { name: "Chandina", thanas: ["Chandina"] },
      ]},
      { name: "Noakhali", upazilas: [
        { name: "Noakhali Sadar", thanas: ["Noakhali Sadar", "Maijdee"] },
        { name: "Begumganj", thanas: ["Begumganj"] },
        { name: "Senbag", thanas: ["Senbag"] },
      ]},
      { name: "Feni", upazilas: [
        { name: "Feni Sadar", thanas: ["Feni Sadar"] },
        { name: "Chhagalnaiya", thanas: ["Chhagalnaiya"] },
        { name: "Sonagazi", thanas: ["Sonagazi"] },
      ]},
      { name: "Brahmanbaria", upazilas: [
        { name: "Brahmanbaria Sadar", thanas: ["Brahmanbaria Sadar"] },
        { name: "Ashuganj", thanas: ["Ashuganj"] },
        { name: "Nabinagar", thanas: ["Nabinagar"] },
      ]},
      { name: "Chandpur", upazilas: [
        { name: "Chandpur Sadar", thanas: ["Chandpur Sadar"] },
        { name: "Haimchar", thanas: ["Haimchar"] },
      ]},
      { name: "Lakshmipur", upazilas: [
        { name: "Lakshmipur Sadar", thanas: ["Lakshmipur Sadar"] },
        { name: "Raipur", thanas: ["Raipur"] },
      ]},
      { name: "Rangamati", upazilas: [
        { name: "Rangamati Sadar", thanas: ["Rangamati Sadar"] },
        { name: "Kaptai", thanas: ["Kaptai"] },
      ]},
      { name: "Khagrachhari", upazilas: [
        { name: "Khagrachhari Sadar", thanas: ["Khagrachhari Sadar"] },
        { name: "Dighinala", thanas: ["Dighinala"] },
      ]},
      { name: "Bandarban", upazilas: [
        { name: "Bandarban Sadar", thanas: ["Bandarban Sadar"] },
        { name: "Thanchi", thanas: ["Thanchi"] },
      ]},
    ],
  },
  {
    division: "Rajshahi",
    districts: [
      { name: "Rajshahi", upazilas: [
        { name: "Rajshahi Sadar", thanas: ["Boalia", "Rajpara", "Motihar", "Shah Makhdum"] },
        { name: "Godagari", thanas: ["Godagari"] },
        { name: "Tanore", thanas: ["Tanore"] },
        { name: "Paba", thanas: ["Paba"] },
        { name: "Durgapur", thanas: ["Durgapur"] },
      ]},
      { name: "Bogra", upazilas: [
        { name: "Bogra Sadar", thanas: ["Bogra Sadar"] },
        { name: "Shibganj", thanas: ["Shibganj"] },
        { name: "Sherpur", thanas: ["Sherpur"] },
        { name: "Gabtali", thanas: ["Gabtali"] },
      ]},
      { name: "Pabna", upazilas: [
        { name: "Pabna Sadar", thanas: ["Pabna Sadar"] },
        { name: "Ishwardi", thanas: ["Ishwardi"] },
        { name: "Chatmohar", thanas: ["Chatmohar"] },
      ]},
      { name: "Natore", upazilas: [
        { name: "Natore Sadar", thanas: ["Natore Sadar"] },
        { name: "Baraigram", thanas: ["Baraigram"] },
      ]},
      { name: "Naogaon", upazilas: [
        { name: "Naogaon Sadar", thanas: ["Naogaon Sadar"] },
        { name: "Manda", thanas: ["Manda"] },
      ]},
      { name: "Nawabganj", upazilas: [
        { name: "Nawabganj Sadar", thanas: ["Nawabganj Sadar"] },
        { name: "Shibganj", thanas: ["Shibganj"] },
      ]},
      { name: "Sirajganj", upazilas: [
        { name: "Sirajganj Sadar", thanas: ["Sirajganj Sadar"] },
        { name: "Shahzadpur", thanas: ["Shahzadpur"] },
      ]},
      { name: "Joypurhat", upazilas: [
        { name: "Joypurhat Sadar", thanas: ["Joypurhat Sadar"] },
        { name: "Kalai", thanas: ["Kalai"] },
      ]},
    ],
  },
  {
    division: "Khulna",
    districts: [
      { name: "Khulna", upazilas: [
        { name: "Khulna Sadar", thanas: ["Khulna Sadar", "Sonadanga", "Khalishpur"] },
        { name: "Dumuria", thanas: ["Dumuria"] },
        { name: "Phultala", thanas: ["Phultala"] },
        { name: "Dighalia", thanas: ["Dighalia"] },
        { name: "Daulatpur", thanas: ["Daulatpur"] },
      ]},
      { name: "Jessore", upazilas: [
        { name: "Jessore Sadar", thanas: ["Jessore Sadar", "Kotwali"] },
        { name: "Benapole", thanas: ["Benapole"] },
        { name: "Abhaynagar", thanas: ["Abhaynagar"] },
      ]},
      { name: "Satkhira", upazilas: [
        { name: "Satkhira Sadar", thanas: ["Satkhira Sadar"] },
        { name: "Shyamnagar", thanas: ["Shyamnagar"] },
      ]},
      { name: "Bagerhat", upazilas: [
        { name: "Bagerhat Sadar", thanas: ["Bagerhat Sadar"] },
        { name: "Mongla", thanas: ["Mongla"] },
      ]},
      { name: "Kushtia", upazilas: [
        { name: "Kushtia Sadar", thanas: ["Kushtia Sadar"] },
        { name: "Kumarkhali", thanas: ["Kumarkhali"] },
      ]},
      { name: "Meherpur", upazilas: [
        { name: "Meherpur Sadar", thanas: ["Meherpur Sadar"] },
        { name: "Mujibnagar", thanas: ["Mujibnagar"] },
      ]},
      { name: "Chuadanga", upazilas: [
        { name: "Chuadanga Sadar", thanas: ["Chuadanga Sadar"] },
        { name: "Damurhuda", thanas: ["Damurhuda"] },
      ]},
      { name: "Jhenaidah", upazilas: [
        { name: "Jhenaidah Sadar", thanas: ["Jhenaidah Sadar"] },
        { name: "Shailkupa", thanas: ["Shailkupa"] },
      ]},
      { name: "Magura", upazilas: [
        { name: "Magura Sadar", thanas: ["Magura Sadar"] },
        { name: "Shalikha", thanas: ["Shalikha"] },
      ]},
      { name: "Narail", upazilas: [
        { name: "Narail Sadar", thanas: ["Narail Sadar"] },
        { name: "Lohagara", thanas: ["Lohagara"] },
      ]},
    ],
  },
  {
    division: "Barishal",
    districts: [
      { name: "Barishal", upazilas: [
        { name: "Barishal Sadar", thanas: ["Barishal Sadar", "Kotwali"] },
        { name: "Bakerganj", thanas: ["Bakerganj"] },
        { name: "Babuganj", thanas: ["Babuganj"] },
        { name: "Banaripara", thanas: ["Banaripara"] },
      ]},
      { name: "Bhola", upazilas: [
        { name: "Bhola Sadar", thanas: ["Bhola Sadar"] },
        { name: "Daulatkhan", thanas: ["Daulatkhan"] },
      ]},
      { name: "Patuakhali", upazilas: [
        { name: "Patuakhali Sadar", thanas: ["Patuakhali Sadar"] },
        { name: "Kalapara", thanas: ["Kalapara"] },
      ]},
      { name: "Pirojpur", upazilas: [
        { name: "Pirojpur Sadar", thanas: ["Pirojpur Sadar"] },
        { name: "Nazirpur", thanas: ["Nazirpur"] },
      ]},
      { name: "Barguna", upazilas: [
        { name: "Barguna Sadar", thanas: ["Barguna Sadar"] },
        { name: "Amtali", thanas: ["Amtali"] },
      ]},
      { name: "Jhalokathi", upazilas: [
        { name: "Jhalokathi Sadar", thanas: ["Jhalokathi Sadar"] },
        { name: "Nalchity", thanas: ["Nalchity"] },
      ]},
    ],
  },
  {
    division: "Sylhet",
    districts: [
      { name: "Sylhet", upazilas: [
        { name: "Sylhet Sadar", thanas: ["Sylhet Sadar", "Kotwali", "South Surma"] },
        { name: "Beanibazar", thanas: ["Beanibazar"] },
        { name: "Golapganj", thanas: ["Golapganj"] },
        { name: "Jaintiapur", thanas: ["Jaintiapur"] },
        { name: "Kanaighat", thanas: ["Kanaighat"] },
      ]},
      { name: "Moulvibazar", upazilas: [
        { name: "Moulvibazar Sadar", thanas: ["Moulvibazar Sadar"] },
        { name: "Sreemangal", thanas: ["Sreemangal"] },
        { name: "Kamalganj", thanas: ["Kamalganj"] },
      ]},
      { name: "Habiganj", upazilas: [
        { name: "Habiganj Sadar", thanas: ["Habiganj Sadar"] },
        { name: "Nabiganj", thanas: ["Nabiganj"] },
      ]},
      { name: "Sunamganj", upazilas: [
        { name: "Sunamganj Sadar", thanas: ["Sunamganj Sadar"] },
        { name: "Chhatak", thanas: ["Chhatak"] },
      ]},
    ],
  },
  {
    division: "Rangpur",
    districts: [
      { name: "Rangpur", upazilas: [
        { name: "Rangpur Sadar", thanas: ["Rangpur Sadar", "Kotwali"] },
        { name: "Pirgachha", thanas: ["Pirgachha"] },
        { name: "Mithapukur", thanas: ["Mithapukur"] },
        { name: "Badarganj", thanas: ["Badarganj"] },
      ]},
      { name: "Dinajpur", upazilas: [
        { name: "Dinajpur Sadar", thanas: ["Dinajpur Sadar"] },
        { name: "Birampur", thanas: ["Birampur"] },
        { name: "Parbatipur", thanas: ["Parbatipur"] },
      ]},
      { name: "Kurigram", upazilas: [
        { name: "Kurigram Sadar", thanas: ["Kurigram Sadar"] },
        { name: "Nageshwari", thanas: ["Nageshwari"] },
      ]},
      { name: "Gaibandha", upazilas: [
        { name: "Gaibandha Sadar", thanas: ["Gaibandha Sadar"] },
        { name: "Gobindaganj", thanas: ["Gobindaganj"] },
      ]},
      { name: "Lalmonirhat", upazilas: [
        { name: "Lalmonirhat Sadar", thanas: ["Lalmonirhat Sadar"] },
        { name: "Kaliganj", thanas: ["Kaliganj"] },
      ]},
      { name: "Nilphamari", upazilas: [
        { name: "Nilphamari Sadar", thanas: ["Nilphamari Sadar"] },
        { name: "Saidpur", thanas: ["Saidpur"] },
      ]},
      { name: "Panchagarh", upazilas: [
        { name: "Panchagarh Sadar", thanas: ["Panchagarh Sadar"] },
        { name: "Tetulia", thanas: ["Tetulia"] },
      ]},
      { name: "Thakurgaon", upazilas: [
        { name: "Thakurgaon Sadar", thanas: ["Thakurgaon Sadar"] },
        { name: "Ranisankail", thanas: ["Ranisankail"] },
      ]},
    ],
  },
  {
    division: "Mymensingh",
    districts: [
      { name: "Mymensingh", upazilas: [
        { name: "Mymensingh Sadar", thanas: ["Mymensingh Sadar", "Kotwali"] },
        { name: "Trishal", thanas: ["Trishal"] },
        { name: "Bhaluka", thanas: ["Bhaluka"] },
        { name: "Muktagachha", thanas: ["Muktagachha"] },
        { name: "Fulbaria", thanas: ["Fulbaria"] },
      ]},
      { name: "Jamalpur", upazilas: [
        { name: "Jamalpur Sadar", thanas: ["Jamalpur Sadar"] },
        { name: "Sherpur", thanas: ["Sherpur"] },
      ]},
      { name: "Netrokona", upazilas: [
        { name: "Netrokona Sadar", thanas: ["Netrokona Sadar"] },
        { name: "Mohanganj", thanas: ["Mohanganj"] },
      ]},
      { name: "Sherpur", upazilas: [
        { name: "Sherpur Sadar", thanas: ["Sherpur Sadar"] },
        { name: "Nalitabari", thanas: ["Nalitabari"] },
      ]},
    ],
  },
];

export default bdAddresses;
