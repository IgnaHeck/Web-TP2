let categorias = [];
let identificadorTemp = [];
let trabajosCargados = 0;
let jobs2 = [];
let sectionTemp = [];
let sumaTotal = 0;
const timer = ms => new Promise(res => setTimeout(res, ms));

let link = null;

Vue.component('cont-home', {
    template: `
    <div class=homepagecont>
        <p class=home>Home</p>
        <hr>
        <p>Bienvenido a nuestra pagina</p> <br>
        <p>Remotive: Muestra los trabajos disponibles en la API</p><br>
        <p>Graficos: Muestra en un grafico de pizza los trabajos por categoria historicamente basado en la informacion de Strapi</p><br>
        <p>Strapi: Actualiza la base de datos de Strapi agregando los trabajos que no se encuentren almacenados</p><br>
        <p>Borrar Strapi: Borra la base de datos de Strapi ENTERA.</p>
    </div>
    `
})

Vue.component('cont-remotive', {
    template: `
    <div class=mainremotive>
        <div v-if="app.loadremotive == false">Cargando...</div>
        <div class="job-box-main" v-if="app.loadremotive == true" :set="url = []">
            <table id="tabla" class="tabla">
                <tbody id="mitabla">
                    <tr class="job-box-card" v-for="(job, index) in app.jobs" :key="index" :set="url[job] = app.jobs[index]">
                        <div class="logo">
                            <img :src="url[job].company_logo_url || 'assets/img-error.png'">
                        </div>
                        <div class="texto-trabajo-box">
                            Titulo: {{ app.jobs[index].title }} <br>
                            Ubicacion: {{ app.jobs[index].candidate_required_location }} <br>
                            Categoria: {{ app.jobs[index].category }} <br>
                            Salario: {{ app.jobs[index].salary }} <br>
                            Fecha de Publicacion: {{ app.jobs[index].publication_date }} <br>
                            Nombre empresa: {{ app.jobs[index].company_name }} <br>
                            URL: <a class="link-trabajo" target="_blank" v-bind:href="url[job].url"> {{ url[job].url }} </a><br>
                        </div>
                    </tr>
                </tbody>
            </table>   
        </div> 
    </div>
    `
})



Vue.component('cont-strapi', {
    template: `
    <div>
        <a class="link-trabajo" target="_blank" href="https://strapi.io">Hola Strapi!</a> <br>
        <a class="link-trabajo" target="_blank" href="http://localhost:1337/admin">Control Panel</a>
    </div>
    `
})

Vue.component('cont-graficos',{
    template: `
    <div>
        <p>Graficos</p>
        <vc-donut has-legend legend-placement="bottom" :thickness="100" :sections="app.sections" :auto-adjust-text-size="true" :start-angle="0" :total=app.totalValues>
        </vc-donut>
        </div>
        `
})
    
Vue.component('cont-borrarstrapi',{
    template: `
    <div>
        <p>Se borra todo en Strapi</p>
    </div>
    `
})
    
    let app = new Vue({
        el: '#main-container',
        data: {
            jobs: null,
            currentContent: 'Home',
            contents: ['Home', 'Remotive', 'Graficos', 'Strapi', 'BorrarStrapi'],
            loadremotive: false,
            seen: true,
        resultado: '',
        idStart: 0,
        value: 1,
        totalValues: 0,
        label: '',
        sectionTemp: [],
        sections: [],
    },
    computed: {
        currentTabComponent: function () {
            let nombreBoton = 'cont-' + this.currentContent.toLowerCase()
            if (nombreBoton === 'cont-strapi') {
                this.crearTrabajo()
            }
            if(nombreBoton === 'cont-graficos') {
                this.getTrabajo()
            }
            if (nombreBoton === 'cont-borrarstrapi') {
                this.delStrapiData()
            }
            return nombreBoton
        }
    },
    
    methods: {
        handleSectionClick(section, event) {
            console.log(`${section.label} clicked.`);
        },

        crearTrabajo(){
            firstFunction()
            function firstFunction(){
                axios.get('https://remotive.io/api/remote-jobs', {
                })
                .then(res => {
                    jobs2 = res.data.jobs;
                })
                trabajosCargados = 0;
                axios.get('http://localhost:1337/trabajos?_limit=-1', {
                }).then(res => {
                    for(trabajo in res.data){
                        trabajosCargados = trabajosCargados + 1
                        identificadorTemp.push(res.data[trabajo].Identificador)
                    }
                console.log("ID's cargados: ",identificadorTemp);
                console.log("Trabajos cargados: ", trabajosCargados);
                console.log("Trabajos encontrados: ",jobs2.length);  
                secondFunction()
                })
            }
            
            function secondFunction(){
                async function load () {
                    for (i in jobs2){
                        if(!(identificadorTemp.includes(jobs2[i].id))){
                            console.log("Agregando trabajo a la base de datos, id:", jobs2[i].id);
                            axios.post('http://localhost:1337/trabajos', {
                            Ubicacion: jobs2[i].candidate_required_location,
                            Categoria: jobs2[i].category,
                            Logo: jobs2[i].company_logo_url,
                            NombreEmpresa: jobs2[i].company_name,
                            Identificador: jobs2[i].id,
                            Tipo: jobs2[i].job_type,
                            FechaPublicacion: jobs2[i].publication_date,
                            Salario: jobs2[i].salary,
                            Titulo: jobs2[i].title,
                            URL: jobs2[i].url,
                            })
                        } else {
                            console.log("El trabajo ya se encuentra en la base de datos");
                        }
                        await timer(50);
                    }
                }
                load();
            }
        },

        getTrabajo(){
            let contador = 0;
            axios.get('http://localhost:1337/trabajos?_limit=-1&_sort=Categoria', {
            }).then(res => {
            for(trabajo in res.data){
                if(!(categorias.includes(res.data[trabajo].Categoria))){
                    console.log("No se encuentra el elemento:", res.data[trabajo].Categoria, " agregando a la lista...");
                    categorias.push(res.data[trabajo].Categoria);
                    sectionTemp["label"] = res.data[trabajo].Categoria;                     //label
                    sectionTemp["value"] = contarElementos(res.data[trabajo].Categoria);    //numero
                    this.sections.push(sectionTemp);
                    sectionTemp = [];      
                }
            }
            function contarElementos(param){
                contador = 0;
                for(trabajo in res.data){
                    if((res.data[trabajo].Categoria.includes(param))){
                        contador = contador + 1
                    }
                }
                sumaTotal = sumaTotal + contador;
                //console.log("Contador: ",contador);
                return contador;
            }


            //console.log(this.sections);
            console.log("Categorias individuales cargadas:", categorias.length);
            this.totalValues = sumaTotal;

            })
        },
        
        delStrapiData(){
            axios.get('http://localhost:1337/trabajos?_limit=-1', {
            }).then(res => {
                identificadorTemp = []
                trabajosCargados = 0;
                for(trabajo in res.data){
                    trabajosCargados = trabajosCargados + 1
                    identificadorTemp.push(res.data[trabajo].id)
                }
            })

            async function load () {
                for (let i = 0; i <= trabajosCargados; i++) {
                    console.log("DELETE!", identificadorTemp[i]);
                    axios.delete(`http://localhost:1337/trabajos/${identificadorTemp[i]}`);
                    await timer(50);
                }
            }
            load();
        }
    },

        
    mounted() {
        console.log("Llamada a Remotive!")
        axios.get('https://remotive.io/api/remote-jobs', {
        })
        .then(res => {
            jobs2 = res.data.jobs
            this.jobs = res.data.jobs;
            this.loadremotive = true;
            console.log("Datos cargados!");
        })
        .catch(err =>{
            console.error(err);
        })
    },
})

Vue.use(vcdonut.default);

